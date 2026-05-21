import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';
import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { getDb, EntityRepository, RelationRepository } from '@ai-vantage/db';
import { seedM3Demo } from '@ai-vantage/db/seed-m3';

describe('M4 document ingest API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const seed = buildSeedFromContent();
    const db = getDb();
    await new EntityRepository(db).upsertMany(seed.entities);
    await new RelationRepository(db).upsertMany(seed.relations);
    await seedM3Demo();
    app = createApp();
  });

  it('POST /documents/from-mdx registers platform article', async () => {
    const res = await app.request('/documents/from-mdx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test' },
      body: JSON.stringify({ kind: 'targets', slug: 'amd' }),
    });
    expect(res.status).toBe(201);
    const doc = (await res.json()) as { id: string; ingestionStatus: string };
    expect(doc.id).toBe('mdx-targets-amd');
    expect(['registered', 'completed']).toContain(doc.ingestionStatus);
  });

  it('POST /documents/:id/ingest creates candidate assertions', async () => {
    const reg = await app.request('/documents/from-mdx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'targets', slug: 'amd' }),
    });
    const { id } = (await reg.json()) as { id: string };

    const ingestRes = await app.request(`/documents/${id}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Actor-Id': 'test-ingest' },
    });
    expect(ingestRes.status).toBe(200);
    const job = (await ingestRes.json()) as {
      status: string;
      result?: { assertionCount: number; createdAssertionIds: string[] };
    };
    expect(job.status).toBe('completed');
    expect(job.result?.assertionCount).toBeGreaterThan(0);

    const listRes = await app.request('/assertions?status=candidate&subjectEntityId=amd');
    const { assertions } = (await listRes.json()) as { assertions: { generatedBy?: string }[] };
    const aiGenerated = assertions.filter((a) => a.generatedBy?.startsWith('ai:'));
    expect(aiGenerated.length).toBeGreaterThan(0);
  });

  it('GET /documents/:id/extractions returns completed job', async () => {
    const reg = await app.request('/documents/from-mdx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'targets', slug: 'nvidia' }),
    });
    const { id } = (await reg.json()) as { id: string };
    await app.request(`/documents/${id}/ingest`, { method: 'POST' });

    const res = await app.request(`/documents/${id}/extractions`);
    expect(res.status).toBe(200);
    const { extractions } = (await res.json()) as {
      extractions: { status: string; result?: { conflictCount: number } }[];
    };
    expect(extractions.length).toBeGreaterThan(0);
    expect(extractions[0].status).toBe('completed');
  });

  it('ingest conflict demo may report conflicts vs active assertions', async () => {
    const createRes = await app.request('/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `doc-conflict-${Date.now()}`,
        title: 'Conflict test',
        sourceType: 'user_upload',
        rawText: 'HBM 供给紧张程度已有缓解，库存压力下降。',
        metadata: { primaryEntityId: 'nvidia' },
      }),
    });
    expect(createRes.status).toBe(201);
    const { id } = (await createRes.json()) as { id: string };

    const ingestRes = await app.request(`/documents/${id}/ingest`, { method: 'POST' });
    expect(ingestRes.status).toBe(200);
    const job = (await ingestRes.json()) as { result?: { conflictCount: number } };
    expect(job.result?.conflictCount).toBeGreaterThanOrEqual(0);
  });
});
