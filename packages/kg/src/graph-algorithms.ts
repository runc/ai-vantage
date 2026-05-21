export interface GraphEdgeLike {
  source: string;
  target: string;
  id?: string;
}

function buildAdjacency(
  edges: GraphEdgeLike[],
): Map<string, Array<{ neighbor: string; edgeIndex: number }>> {
  const adj = new Map<string, Array<{ neighbor: string; edgeIndex: number }>>();
  for (let i = 0; i < edges.length; i++) {
    const { source, target } = edges[i];
    if (!adj.has(source)) adj.set(source, []);
    if (!adj.has(target)) adj.set(target, []);
    adj.get(source)!.push({ neighbor: target, edgeIndex: i });
    adj.get(target)!.push({ neighbor: source, edgeIndex: i });
  }
  return adj;
}

export function findAllPaths(
  edges: GraphEdgeLike[],
  startId: string,
  endId: string,
  maxDepth = 5,
): string[][] {
  const adj = buildAdjacency(edges);
  if (!adj.has(startId) || !adj.has(endId)) return [];
  if (startId === endId) return [[startId]];

  const results: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[]): void {
    if (path.length - 1 >= maxDepth) return;
    const neighbors = adj.get(current);
    if (!neighbors) return;
    for (const { neighbor } of neighbors) {
      if (visited.has(neighbor)) continue;
      if (neighbor === endId) {
        results.push([...path, neighbor]);
        continue;
      }
      visited.add(neighbor);
      path.push(neighbor);
      dfs(neighbor, path);
      path.pop();
      visited.delete(neighbor);
    }
  }

  visited.add(startId);
  dfs(startId, [startId]);
  return results;
}

export function getNHopNeighbors(
  edges: GraphEdgeLike[],
  nodeId: string,
  hops: number,
): { nodeIds: Set<string>; relationIds: Set<string> } {
  const adj = buildAdjacency(edges);
  const visitedNodes = new Set<string>();
  const relationIds = new Set<string>();

  if (!adj.has(nodeId)) return { nodeIds: visitedNodes, relationIds };

  visitedNodes.add(nodeId);
  let frontier = [nodeId];

  for (let hop = 0; hop < hops; hop++) {
    const nextFrontier: string[] = [];
    for (const current of frontier) {
      const neighbors = adj.get(current);
      if (!neighbors) continue;
      for (const { neighbor, edgeIndex } of neighbors) {
        const edge = edges[edgeIndex];
        const relId = edge.id ?? `rel-${edge.source}-${edge.target}-${edgeIndex}`;
        relationIds.add(relId);
        if (!visitedNodes.has(neighbor)) {
          visitedNodes.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }
    frontier = nextFrontier;
  }

  return { nodeIds: visitedNodes, relationIds };
}
