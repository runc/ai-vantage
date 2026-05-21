import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';
import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { getDb, EntityRepository, RelationRepository } from '@ai-vantage/db';
import { exploreResponseSchema } from '@ai-vantage/contracts';

describe('graph explore API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const seed = buildSeedFromContent();
    const db = getDb();
    await new EntityRepository(db).upsertMany(seed.entities);
    await new RelationRepository(db).upsertMany(seed.relations);
    app = createApp();
  });

  it('GET /graph/explore?q=英伟达 上下游', async () => {
    const params = new URLSearchParams({ q: '英伟达 上下游' });
    const res = await app.request(`/graph/explore?${params}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    const parsed = exploreResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.parse.focus?.id).toBe('nvidia');
      expect(parsed.data.parser).toBe('rule');
      expect(parsed.data.nodeIds).toContain('nvidia');
      expect(parsed.data.graph.entities.length).toBeGreaterThan(0);
    }
  });

  it('GET /graph/explore?q=AI产业链 returns layers', async () => {
    const params = new URLSearchParams({ q: 'AI产业链' });
    const res = await app.request(`/graph/explore?${params}`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.parse.mode).toBe('industry_chain');
    expect(json.nodeIds.length).toBeGreaterThanOrEqual(7);
  });
});
