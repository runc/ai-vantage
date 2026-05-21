import { describe, it, expect } from 'vitest';
import { buildSeedFromContent } from './build-seed';
import { standardToLegacyGraph } from '../adapters/legacy-graph';
import { loadRelationsJson, resolveContentDir } from './load-content';

describe('seed parity with relations.json', () => {
  it('produces same graph size as legacy JSON', () => {
    const legacy = loadRelationsJson(resolveContentDir());
    const seed = buildSeedFromContent();
    const converted = standardToLegacyGraph(seed.entities, seed.relations);

    expect(converted.nodes.length).toBe(legacy.nodes.length);
    expect(converted.edges.length).toBe(legacy.edges.length);
  });
});
