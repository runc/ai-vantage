import type { Assertion, Evidence } from '@ai-vantage/kg';
import { RecordStatus, DocumentSourceType, RelationPredicate } from '@ai-vantage/kg';
import { getDb } from './client.js';
import { AssertionRepository } from './repositories/assertion-repository.js';
import { EvidenceRepository } from './repositories/evidence-repository.js';

/** Demo assertions + evidences for M3 review UI (idempotent upsert by id). */
export async function seedM3Demo(): Promise<void> {
  const db = getDb();
  const assertionRepo = new AssertionRepository(db);
  const evidenceRepo = new EvidenceRepository(db);

  const evidences: Evidence[] = [
    {
      id: 'ev-nvidia-layer',
      sourceType: DocumentSourceType.platform_article,
      sourceTitle: 'NVIDIA 投资逻辑（电子书）',
      sourceUrl: '/explore/target/nvidia',
      evidenceSpan: 'GPU 在 AI 训练中的主导地位构成核心护城河。',
      reliabilityScore: 0.85,
    },
    {
      id: 'ev-tsmc-supply',
      sourceType: DocumentSourceType.platform_article,
      sourceTitle: 'TSMC 投资逻辑',
      sourceUrl: '/explore/target/tsmc',
      evidenceSpan: '先进制程产能是 AI 芯片供应链的关键瓶颈。',
      reliabilityScore: 0.8,
    },
    {
      id: 'ev-openai-candidate',
      sourceType: DocumentSourceType.platform_article,
      sourceTitle: 'OpenAI 投资逻辑',
      evidenceSpan: '模型能力与生态绑定决定长期估值上限（待审核）。',
      reliabilityScore: 0.6,
    },
  ];

  for (const e of evidences) {
    const existing = await evidenceRepo.findById(e.id);
    if (!existing) await evidenceRepo.create(e);
  }

  const assertions: Assertion[] = [
    {
      id: 'asrt-nvidia-dominance',
      subjectEntityId: 'nvidia',
      predicate: RelationPredicate.benefits_from,
      objectEntityId: 'cloud-platform',
      claimText: 'NVIDIA 在 AI 训练 GPU 市场占据主导地位，受益于云厂商 CapEx 扩张。',
      confidence: 0.88,
      status: RecordStatus.active,
      evidenceIds: ['ev-nvidia-layer'],
      generatedBy: 'seed-m3',
      reviewedBy: 'seed-m3',
    },
    {
      id: 'asrt-tsmc-bottleneck',
      subjectEntityId: 'tsmc',
      predicate: RelationPredicate.upstream_of,
      objectEntityId: 'nvidia',
      claimText: 'TSMC 先进制程产能制约高端 AI 芯片供给，议价能力强。',
      confidence: 0.82,
      status: RecordStatus.active,
      evidenceIds: ['ev-tsmc-supply'],
      generatedBy: 'seed-m3',
      reviewedBy: 'seed-m3',
    },
    {
      id: 'asrt-openai-candidate',
      subjectEntityId: 'openai',
      predicate: RelationPredicate.competes_with,
      objectEntityId: 'google',
      claimText: 'OpenAI 与 Google 在基础模型层形成直接竞争，客户重叠度上升。',
      confidence: 0.55,
      status: RecordStatus.candidate,
      evidenceIds: ['ev-openai-candidate'],
      generatedBy: 'seed-m3',
    },
    {
      id: 'asrt-amd-candidate',
      subjectEntityId: 'amd',
      predicate: RelationPredicate.competes_with,
      objectEntityId: 'nvidia',
      claimText: 'AMD MI 系列在部分推理场景取得份额，但整体训练市场仍落后（待核实）。',
      confidence: 0.5,
      status: RecordStatus.candidate,
      evidenceIds: [],
      generatedBy: 'seed-m3',
    },
  ];

  for (const a of assertions) {
    const existing = await assertionRepo.findById(a.id);
    if (!existing) {
      await assertionRepo.create(a);
    } else {
      await assertionRepo.update(a.id, a);
    }
  }

  console.log(`M3 demo seed: ${assertions.length} assertions, ${evidences.length} evidences`);
}
