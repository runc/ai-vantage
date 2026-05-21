import { describe, it, expect } from 'vitest';
import { buildSeedFromContent } from '../seed/build-seed.js';
import { standardToLegacyGraph } from '../adapters/legacy-graph.js';
import { executeExplore, parseExploreQuery } from './index.js';

describe('explore query', () => {
  const seed = buildSeedFromContent();
  const legacy = standardToLegacyGraph(seed.entities, seed.relations);
  const entities = seed.entities.map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    aliases: e.aliases,
    properties: e.properties,
    legacyNodeType: (e.properties?.legacyNodeType as 'layer' | 'target' | 'concept') ?? undefined,
  }));
  const relations = legacy.edges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    type: e.type,
  }));

  it('resolves 英伟达 to nvidia', () => {
    const parse = parseExploreQuery('英伟达 上下游', { entities });
    expect(parse.focus?.id).toBe('nvidia');
    expect(parse.mode).toBe('supply_chain');
  });

  it('parses AI产业链 as industry_chain', () => {
    const parse = parseExploreQuery('AI产业链', { entities });
    expect(parse.mode).toBe('industry_chain');
    expect(parse.layerIds?.length).toBeGreaterThanOrEqual(5);
  });

  it('parses path between two companies', () => {
    const parse = parseExploreQuery('nvidia 到 asml', { entities });
    expect(parse.mode).toBe('path_between');
    expect(parse.focus?.id).toBe('nvidia');
    expect(parse.pathEnd?.id).toBe('asml');
  });

  it('executeExplore returns nodes for nvidia supply chain', () => {
    const result = executeExplore('英伟达 上下游', entities, relations);
    expect(result.nodeIds).toContain('nvidia');
    expect(result.nodeIds.length).toBeGreaterThan(1);
  });
});
