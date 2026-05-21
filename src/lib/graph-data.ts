import type { Node, Edge } from '@xyflow/react';
import { getAllLayers, getAllTargets, getAllConcepts } from './content';
import type { ViewNode, ViewEdge } from './graph-view-model';
import { CERTAINTY_COLORS, EDGE_STYLES } from './graph-constants';
import { computePositions } from './graph-grid-layout';
import { loadGraphData, getGraphDataSourceLabel, shouldUseApiPaths } from './graph-meta';
import type { GraphLoadResult } from './graph-meta';

export { loadGraphData, getGraphDataSourceLabel, shouldUseApiPaths };
export type { GraphLoadResult };

// Re-export for convenience (server-side usage)
export { CERTAINTY_COLORS, EDGE_STYLES };

/** Default dimensions for node types */
const NODE_DIMENSIONS = {
  layer: { width: 220, height: 80 },
  target: { width: 180, height: 60 },
  concept: { width: 150, height: 50 },
} as const;

let cachedMeta: GraphLoadResult | null = null;

async function ensureGraphLoaded(): Promise<GraphLoadResult> {
  if (!cachedMeta) {
    cachedMeta = await loadGraphData();
  }
  return cachedMeta;
}

/** Load graph nodes/edges (API or M1 kg static). */
export async function getRawGraphData(): Promise<{
  graphNodes: ViewNode[];
  graphEdges: ViewEdge[];
}> {
  const meta = await ensureGraphLoaded();
  return { graphNodes: meta.graphNodes, graphEdges: meta.graphEdges };
}

export async function getGraphPageMeta(): Promise<GraphLoadResult> {
  return ensureGraphLoaded();
}

/**
 * Transform content entities and relations into React Flow compatible format.
 * Uses lightweight grid layout; ELK runs client-side for better layout.
 * Enriches nodes with full metadata from content files for detail panel.
 */
export async function getReactFlowData(): Promise<{ nodes: Node[]; edges: Edge[] }> {
  const { graphNodes, graphEdges } = await getRawGraphData();

  const layers = getAllLayers();
  const targets = getAllTargets();
  const concepts = getAllConcepts();

  // Build lookup maps
  const layerMap = new Map(layers.map((l) => [l.frontmatter.id, l]));
  const targetMap = new Map(targets.map((t) => [t.frontmatter.id, t]));
  const conceptMap = new Map(concepts.map((c) => [c.frontmatter.id, c]));

  // Use lightweight grid layout on server; ELK runs client-side in knowledge-graph.tsx
  const positions = computePositions(graphNodes);

  // Map to React Flow Nodes with custom types and enriched data
  const nodes: Node[] = graphNodes.map((gNode) => {
    const pos = positions.get(gNode.id) ?? { x: 0, y: 0 };
    const dims = NODE_DIMENSIONS[gNode.type];

    // Enrich with content metadata
    let enrichedData: Record<string, unknown> = {
      label: gNode.label,
      nodeType: gNode.type,
      ...gNode.data,
    };

    if (gNode.type === 'layer') {
      const layer = layerMap.get(gNode.id);
      if (layer) {
        enrichedData = {
          ...enrichedData,
          certainty: layer.frontmatter.certainty,
          rank: layer.frontmatter.rank,
          summary: layer.frontmatter.summary,
          representatives: layer.frontmatter.representatives,
        };
      }
    } else if (gNode.type === 'target') {
      const target = targetMap.get(gNode.id);
      if (target) {
        enrichedData = {
          ...enrichedData,
          layer: target.frontmatter.layer,
          moat: target.frontmatter.moat,
          risk: target.frontmatter.risk,
          marketPosition: target.frontmatter.marketPosition,
          titleZh: target.frontmatter.titleZh,
        };
      }
    } else if (gNode.type === 'concept') {
      const concept = conceptMap.get(gNode.id);
      if (concept) {
        enrichedData = {
          ...enrichedData,
          relatedLayers: concept.frontmatter.relatedLayers,
          relatedTargets: concept.frontmatter.relatedTargets,
        };
      }
    }

    return {
      id: gNode.id,
      type: gNode.type, // Use custom node type
      position: pos,
      data: enrichedData,
      // React Flow v12: setting width/height at the node level marks the node
      // as already-measured, so it renders immediately instead of staying
      // visibility:hidden until ResizeObserver fires.
      width: dims.width,
      height: dims.height,
    };
  });

  // Map to React Flow Edges with type metadata
  const edges: Edge[] = graphEdges.map((gEdge, index) => {
    const style = EDGE_STYLES[gEdge.type] ?? EDGE_STYLES['relates-to'];
    return {
      id: `e-${gEdge.source}-${gEdge.target}-${index}`,
      source: gEdge.source,
      target: gEdge.target,
      label: gEdge.label,
      type: 'default',
      animated: gEdge.type === 'supplies-to',
      data: { edgeType: gEdge.type },
      style: {
        stroke: style.stroke,
        ...(style.strokeDasharray ? { strokeDasharray: style.strokeDasharray } : {}),
      },
    };
  });

  return { nodes, edges };
}
