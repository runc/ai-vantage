import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';
import { graphQueryResponseSchema } from '@ai-vantage/contracts';
import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { standardToLegacyGraph } from '@ai-vantage/kg/adapters/legacy-graph';
import { findAllPaths } from '@ai-vantage/db';
import { getDb } from '@ai-vantage/db';
import { EntityRepository } from '@ai-vantage/db';
import { RelationRepository } from '@ai-vantage/db';

const PATH_PAIRS = [
  ['nvidia', 'asml'],
  ['openai', 'google'],
  ['sk-hynix', 'physical-engineering'],
] as const;

describe('graph API', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    const seed = buildSeedFromContent();
    const db = getDb();
    await new EntityRepository(db).upsertMany(seed.entities);
    await new RelationRepository(db).upsertMany(seed.relations);
    app = createApp();
  });

  it('GET /health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('GET /graph returns 32 entities and 71 relations', async () => {
    const res = await app.request('/graph');
    expect(res.status).toBe(200);
    const json = await res.json();
    const parsed = graphQueryResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.entities.length).toBeGreaterThanOrEqual(32);
      expect(parsed.data.relations.length).toBeGreaterThanOrEqual(71);
    }
  });

  it.each(PATH_PAIRS)(
    'GET /graph/path matches local BFS for %s → %s',
    async (startId, endId) => {
      const seed = buildSeedFromContent();
      const legacy = standardToLegacyGraph(seed.entities, seed.relations);
      const edgeLikes = legacy.edges.map((e) => ({
        source: e.source,
        target: e.target,
      }));
      const legacyIds = new Set(legacy.nodes.map((n) => n.id));
      const localPaths = findAllPaths(edgeLikes, startId, endId, 5);

      const params = new URLSearchParams({ startId, endId, maxDepth: '5' });
      const res = await app.request(`/graph/path?${params}`);
      expect(res.status).toBe(200);
      const { paths: apiPaths } = (await res.json()) as { paths: string[][] };

      /** M5+ demo entities (domain/events) may add extra paths; compare legacy-only routes. */
      const filterLegacy = (paths: string[][]) =>
        paths.filter((p) => p.every((id) => legacyIds.has(id)));

      const sortPaths = (paths: string[][]) =>
        [...filterLegacy(paths)].map((p) => p.join('>')).sort();

      expect(sortPaths(apiPaths)).toEqual(sortPaths(localPaths));
    },
  );
});
