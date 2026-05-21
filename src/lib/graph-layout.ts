import ELK from 'elkjs/lib/elk-api.js';
import type { GraphNode, GraphEdge } from '@/lib/types';
import { computePositions } from './graph-grid-layout';

export type LayoutDirection = 'LR' | 'TB' | 'RL' | 'BT';

const ELK_DIRECTION: Record<LayoutDirection, string> = {
  LR: 'RIGHT',
  TB: 'DOWN',
  RL: 'LEFT',
  BT: 'UP',
};

const NODE_DIMENSIONS = {
  layer: { width: 220, height: 80 },
  target: { width: 180, height: 60 },
  concept: { width: 150, height: 50 },
} as const;

const LAYOUT_SPACING = {
  nodeSpacing: 30,
  layerSpacing: 100,
} as const;

export async function computeElkLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  direction: LayoutDirection = 'LR',
): Promise<Map<string, { x: number; y: number }>> {
  try {
    const elk = new ELK({
      workerUrl: '/elk-worker.min.js',
    });

    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': ELK_DIRECTION[direction],
        'elk.spacing.nodeNode': String(LAYOUT_SPACING.nodeSpacing),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(
          LAYOUT_SPACING.layerSpacing,
        ),
        'elk.layered.cycleBreaking.strategy': 'GREEDY',
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.portConstraints': 'FREE',
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      },
      children: graphNodes.map((node) => {
        const dims = NODE_DIMENSIONS[node.type];
        return {
          id: node.id,
          width: dims.width,
          height: dims.height,
        };
      }),
      edges: graphEdges.map((edge, index) => ({
        id: `e-${edge.source}-${edge.target}-${index}`,
        sources: [edge.source],
        targets: [edge.target],
      })),
    };

    const layoutResult = await elk.layout(elkGraph);

    const positions = new Map<string, { x: number; y: number }>();

    if (layoutResult.children) {
      for (const child of layoutResult.children) {
        positions.set(child.id, {
          x: child.x ?? 0,
          y: child.y ?? 0,
        });
      }
    }

    if (positions.size === 0) {
      return computePositions(graphNodes);
    }

    return positions;
  } catch (error) {
    console.error('[graph-layout] ELK layout failed, using grid fallback:', error);
    return computePositions(graphNodes);
  }
}
