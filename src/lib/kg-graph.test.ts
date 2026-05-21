import { describe, it, expect } from 'vitest';
import { loadRelationsJson, resolveContentDir } from '@ai-vantage/kg/seed';
import {
  getStandardizedViewGraph,
  EXPECTED_GRAPH_COUNTS,
  assertStandardizedGraphCounts,
} from './kg-graph';

describe('M1 kg-graph', () => {
  it('matches relations.json node and edge counts', () => {
    const legacy = loadRelationsJson(resolveContentDir());
    const { graphNodes, graphEdges } = getStandardizedViewGraph();

    expect(graphNodes).toHaveLength(legacy.nodes.length);
    expect(graphEdges).toHaveLength(legacy.edges.length);
    expect(graphNodes).toHaveLength(EXPECTED_GRAPH_COUNTS.nodes);
    expect(graphEdges).toHaveLength(EXPECTED_GRAPH_COUNTS.edges);
    assertStandardizedGraphCounts(graphNodes, graphEdges);
  });

  it('preserves stable node ids from relations.json', () => {
    const legacy = loadRelationsJson(resolveContentDir());
    const { graphNodes } = getStandardizedViewGraph();
    const legacyIds = new Set(legacy.nodes.map((n) => n.id));
    const seedIds = new Set(graphNodes.map((n) => n.id));
    expect(seedIds).toEqual(legacyIds);
  });
});
