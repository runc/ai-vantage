/**
 * M1: Load graph view data through @ai-vantage/kg (seed → standard model → legacy view).
 * Single source of truth aligned with DB seed and API.
 */
import { buildSeedFromContent } from '@ai-vantage/kg/seed';
import { standardToLegacyGraph } from '@ai-vantage/kg/adapters/legacy-graph';
import type { ViewNode, ViewEdge } from './graph-view-model';

export const EXPECTED_GRAPH_COUNTS = { nodes: 32, edges: 71 } as const;

export function getStandardizedViewGraph(): {
  graphNodes: ViewNode[];
  graphEdges: ViewEdge[];
} {
  const seed = buildSeedFromContent();
  const legacy = standardToLegacyGraph(seed.entities, seed.relations);

  const graphNodes: ViewNode[] = legacy.nodes.map((node) => ({
    id: node.id,
    type: node.type,
    label: node.label,
    data: node.data,
  }));

  const graphEdges: ViewEdge[] = legacy.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    type: edge.type,
    label: edge.label,
  }));

  return { graphNodes, graphEdges };
}

export function assertStandardizedGraphCounts(
  nodes: ViewNode[],
  edges: ViewEdge[],
): void {
  if (
    nodes.length !== EXPECTED_GRAPH_COUNTS.nodes ||
    edges.length !== EXPECTED_GRAPH_COUNTS.edges
  ) {
    throw new Error(
      `Standardized graph count mismatch: expected ${EXPECTED_GRAPH_COUNTS.nodes}/${EXPECTED_GRAPH_COUNTS.edges}, got ${nodes.length}/${edges.length}`,
    );
  }
}
