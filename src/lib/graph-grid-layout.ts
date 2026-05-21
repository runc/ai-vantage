import type { GraphNode } from '@/lib/types';

export function computePositions(
  graphNodes: GraphNode[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const layers = graphNodes.filter((n) => n.type === 'layer');
  const targets = graphNodes.filter((n) => n.type === 'target');
  const concepts = graphNodes.filter((n) => n.type === 'concept');

  layers.forEach((node, i) => {
    positions.set(node.id, { x: 50, y: 100 + i * 150 });
  });

  const TARGETS_PER_ROW = 3;
  targets.forEach((node, i) => {
    const row = Math.floor(i / TARGETS_PER_ROW);
    const col = i % TARGETS_PER_ROW;
    positions.set(node.id, { x: 350 + col * 220, y: 80 + row * 120 });
  });

  concepts.forEach((node, i) => {
    positions.set(node.id, { x: 1100, y: 100 + i * 120 });
  });

  return positions;
}
