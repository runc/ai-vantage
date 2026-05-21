import { loadMdxDocument } from '@ai-vantage/ai';
import type { Document } from '@ai-vantage/kg';
import { DocumentSourceType } from '@ai-vantage/kg';
import { getDb } from './client.js';
import { DocumentRepository } from './repositories/document-repository.js';
import { runDocumentIngest } from './ingest-runner.js';

async function ensureDocument(repo: DocumentRepository, doc: Document) {
  const existing = await repo.findById(doc.id);
  if (!existing) await repo.create(doc);
}

/** Register MDX sources + conflict demo doc; ingest openai target for candidate queue. */
export async function seedM4Demo(): Promise<void> {
  const db = getDb();
  const repo = new DocumentRepository(db);

  for (const slug of ['openai', 'amd'] as const) {
    const source = loadMdxDocument('targets', slug, process.cwd());
    if (!source) continue;
    await ensureDocument(repo, {
      id: source.id,
      title: source.title,
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      rawText: source.rawText,
      parseStatus: 'parsed',
      ingestionStatus: 'registered',
      metadata: source.metadata,
    });
  }

  await ensureDocument(repo, {
    id: 'doc-conflict-demo-nvidia',
    title: 'NVIDIA HBM 观点（冲突演示）',
    sourceType: DocumentSourceType.user_upload,
    rawText:
      '部分渠道认为 HBM 供给紧张程度已有缓解，服务器厂商库存周转加快，对英伟达高端 GPU 交付节奏带来不确定性。',
    parseStatus: 'parsed',
    ingestionStatus: 'registered',
    metadata: { primaryEntityId: 'nvidia' },
  });

  const openaiDoc = await repo.findById('mdx-targets-openai');
  if (openaiDoc) {
    const out = await runDocumentIngest(db, openaiDoc.id);
    if ('error' in out) console.warn('M4 openai ingest:', out.error);
    else console.log(`M4 ingested ${openaiDoc.id}: ${out.result.assertions.length} candidates`);
  }

  console.log('M4 demo seed: documents registered (+ openai ingest if successful)');
}
