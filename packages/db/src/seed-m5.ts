import type { Entity, Relation } from '@ai-vantage/kg';
import { EntityType, RelationPredicate, RecordStatus } from '@ai-vantage/kg';
import { getDb } from './client.js';
import { EntityRepository } from './repositories/entity-repository.js';
import { RelationRepository } from './repositories/relation-repository.js';

const LAYER_IDS = [
  'physical-engineering',
  'oligopoly',
  'cloud-platform',
  'application-model',
  'chip-design',
  'middle-squeeze',
  'zero-barrier',
] as const;

const THEME_IDS = [
  'moat-types',
  'cycle-vs-structure',
  'customer-as-competitor',
  'open-source-pressure',
  'pricing-models',
  'physical-barrier',
  'beyond-the-map',
  'internet-vs-ai',
] as const;

/** M5 demo: Domain + Events + structural relations (idempotent). */
export async function seedM5Demo(): Promise<void> {
  const db = getDb();
  const entityRepo = new EntityRepository(db);
  const relationRepo = new RelationRepository(db);

  const domain: Entity = {
    id: 'domain-ai-industry',
    type: EntityType.Domain,
    name: 'AI 产业链',
    slug: 'ai-industry',
    aliases: ['AI产业链', '人工智能产业链'],
    description: '从物理工程到应用模型的七层投资架构，覆盖算力、模型与云基础设施。',
    properties: {
      summary:
        '以七层架构组织 AI 产业投资逻辑：底层物理与制造壁垒最高，向上逐层面临开源与平台挤压。',
      risks: ['出口管制', 'CapEx 周期', '开源替代', '中间层挤压'],
    },
    status: RecordStatus.active,
    source: 'seed-m5',
  };

  const events: Entity[] = [
    {
      id: 'evt-blackwell-cycle',
      type: EntityType.Event,
      name: 'Blackwell 量产与交付节奏',
      slug: 'blackwell-cycle',
      aliases: ['Blackwell', 'B100'],
      description: '新一代 GPU 架构量产进度影响云厂商 CapEx 与供应链分配。',
      properties: {
        summary: '训练算力升级周期，利好设计层龙头，加剧同业竞争预期。',
        occurredAt: '2024-06-01',
      },
      status: RecordStatus.active,
      source: 'seed-m5',
    },
    {
      id: 'evt-cn-export-control',
      type: EntityType.Event,
      name: '先进制程出口管制收紧',
      slug: 'cn-export-control',
      aliases: ['出口管制', '实体清单'],
      description: '地缘政治导致先进 AI 芯片与设备对华供应受限。',
      properties: {
        summary: '制造与设备层面临区域分化，大陆替代产线投资加速。',
        occurredAt: '2023-10-17',
      },
      status: RecordStatus.active,
      source: 'seed-m5',
    },
  ];

  for (const e of [domain, ...events]) {
    const existing = await entityRepo.findById(e.id);
    if (!existing) await entityRepo.create(e);
    else await entityRepo.update(e.id, e);
  }

  const relations: Relation[] = [];

  for (const layerId of LAYER_IDS) {
    relations.push({
      id: `rel-domain-contains-${layerId}`,
      subjectEntityId: domain.id,
      predicate: RelationPredicate.contains,
      objectEntityId: layerId,
      label: '包含',
      confidence: 1,
      status: RecordStatus.active,
      source: 'seed-m5',
    });
  }

  for (const themeId of THEME_IDS) {
    relations.push({
      id: `rel-domain-theme-${themeId}`,
      subjectEntityId: domain.id,
      predicate: RelationPredicate.relates_to,
      objectEntityId: themeId,
      label: '相关主题',
      confidence: 1,
      status: RecordStatus.active,
      source: 'seed-m5',
    });
  }

  const eventLinks: Array<{ eventId: string; targetId: string }> = [
    { eventId: 'evt-blackwell-cycle', targetId: 'nvidia' },
    { eventId: 'evt-blackwell-cycle', targetId: 'amd' },
    { eventId: 'evt-blackwell-cycle', targetId: 'tsmc' },
    { eventId: 'evt-cn-export-control', targetId: 'tsmc' },
    { eventId: 'evt-cn-export-control', targetId: 'asml' },
    { eventId: 'evt-cn-export-control', targetId: 'domain-ai-industry' },
  ];

  for (const { eventId, targetId } of eventLinks) {
    relations.push({
      id: `rel-event-affects-${eventId}-${targetId}`,
      subjectEntityId: eventId,
      predicate: RelationPredicate.affected_by,
      objectEntityId: targetId,
      label: '影响',
      confidence: 0.9,
      status: RecordStatus.active,
      source: 'seed-m5',
    });
  }

  for (const r of relations) {
    const existing = await relationRepo.findById(r.id);
    if (!existing) await relationRepo.create(r);
    else await relationRepo.update(r.id, r);
  }

  console.log(
    `M5 demo seed: domain 1, events ${events.length}, relations ${relations.length}`,
  );
}
