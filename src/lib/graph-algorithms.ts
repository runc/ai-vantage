import type { ViewEdge as GraphEdge } from '@/lib/graph-view-model';

// ---------------------------------------------------------------------------
// 内部辅助：构建双向邻接表
// ---------------------------------------------------------------------------

/**
 * 从边列表构建双向邻接表。
 * 每条边在两个方向上都被记录（无向图语义），同时保留边在原始数组中的索引，
 * 以便后续生成 `e-{source}-{target}-{index}` 格式的边 ID。
 */
function buildAdjacency(
  edges: GraphEdge[],
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

// ---------------------------------------------------------------------------
// findAllPaths – 查找两节点之间的所有路径（DFS + 环检测）
// ---------------------------------------------------------------------------

/**
 * 查找从 `startId` 到 `endId` 的所有简单路径（无重复节点）。
 *
 * @param edges    - 图的边列表
 * @param startId  - 起始节点 ID
 * @param endId    - 目标节点 ID
 * @param maxDepth - 路径最大深度（节点数 - 1），默认 5
 * @returns 所有路径组成的数组，每条路径是节点 ID 的有序数组
 */
export function findAllPaths(
  edges: GraphEdge[],
  startId: string,
  endId: string,
  maxDepth: number = 5,
): string[][] {
  const adj = buildAdjacency(edges);

  // 起始或目标节点不在图中，直接返回空
  if (!adj.has(startId) || !adj.has(endId)) return [];

  // 起始和目标相同
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

// ---------------------------------------------------------------------------
// getNHopNeighbors – 获取 N 跳邻居（BFS）
// ---------------------------------------------------------------------------

/**
 * 获取距离给定节点 N 跳以内的所有节点和边。
 *
 * @param edges  - 图的边列表
 * @param nodeId - 中心节点 ID
 * @param hops   - 跳数（1、2 或 3）
 * @returns 包含节点 ID 集合和边 ID 集合的对象。
 *          边 ID 格式为 `e-{source}-{target}-{index}`。
 */
export function getNHopNeighbors(
  edges: GraphEdge[],
  nodeId: string,
  hops: number,
): { nodes: Set<string>; edges: Set<string> } {
  const adj = buildAdjacency(edges);
  const visitedNodes = new Set<string>();
  const resultEdges = new Set<string>();

  // 如果中心节点不在图中，返回空集合
  if (!adj.has(nodeId)) {
    return { nodes: visitedNodes, edges: resultEdges };
  }

  visitedNodes.add(nodeId);
  let frontier = [nodeId];

  for (let hop = 0; hop < hops; hop++) {
    const nextFrontier: string[] = [];

    for (const current of frontier) {
      const neighbors = adj.get(current);
      if (!neighbors) continue;

      for (const { neighbor, edgeIndex } of neighbors) {
        // 记录边（使用原始 source → target 方向）
        const edge = edges[edgeIndex];
        const edgeId = `e-${edge.source}-${edge.target}-${edgeIndex}`;
        resultEdges.add(edgeId);

        if (!visitedNodes.has(neighbor)) {
          visitedNodes.add(neighbor);
          nextFrontier.push(neighbor);
        }
      }
    }

    frontier = nextFrontier;
  }

  return { nodes: visitedNodes, edges: resultEdges };
}

// ---------------------------------------------------------------------------
// findShortestPath – 查找两节点之间的最短路径（BFS）
// ---------------------------------------------------------------------------

/**
 * 使用 BFS 查找从 `startId` 到 `endId` 的最短路径。
 *
 * @param edges   - 图的边列表
 * @param startId - 起始节点 ID
 * @param endId   - 目标节点 ID
 * @returns 最短路径的节点 ID 数组，如果不可达则返回 `null`
 */
export function findShortestPath(
  edges: GraphEdge[],
  startId: string,
  endId: string,
): string[] | null {
  const adj = buildAdjacency(edges);

  if (!adj.has(startId) || !adj.has(endId)) return null;
  if (startId === endId) return [startId];

  const visited = new Set<string>([startId]);
  const parent = new Map<string, string>();
  const queue: string[] = [startId];

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const neighbors = adj.get(current);
    if (!neighbors) continue;

    for (const { neighbor } of neighbors) {
      if (visited.has(neighbor)) continue;

      visited.add(neighbor);
      parent.set(neighbor, current);

      if (neighbor === endId) {
        // 回溯构建路径
        const path: string[] = [];
        let node: string | undefined = endId;
        while (node !== undefined) {
          path.push(node);
          node = parent.get(node);
        }
        return path.reverse();
      }

      queue.push(neighbor);
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// getConnectedComponent – 获取连通分量（BFS）
// ---------------------------------------------------------------------------

/**
 * 获取与指定节点处于同一连通分量中的所有节点。
 *
 * @param edges  - 图的边列表
 * @param nodeId - 任意节点 ID
 * @returns 同一连通分量内所有节点 ID 的集合
 */
export function getConnectedComponent(
  edges: GraphEdge[],
  nodeId: string,
): Set<string> {
  const adj = buildAdjacency(edges);
  const component = new Set<string>();

  // 如果节点不在图中，返回空集合
  if (!adj.has(nodeId)) return component;

  const queue: string[] = [nodeId];
  component.add(nodeId);

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const neighbors = adj.get(current);
    if (!neighbors) continue;

    for (const { neighbor } of neighbors) {
      if (component.has(neighbor)) continue;
      component.add(neighbor);
      queue.push(neighbor);
    }
  }

  return component;
}
