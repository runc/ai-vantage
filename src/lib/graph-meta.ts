import {
  fetchApiHealth,
  fetchGraphFromApi,
  getGraphDataSource,
} from './api-client';
import {
  getStandardizedViewGraph,
  assertStandardizedGraphCounts,
} from './kg-graph';
import type { ViewEdge, ViewNode } from './graph-view-model';

export interface GraphLoadResult {
  graphNodes: ViewNode[];
  graphEdges: ViewEdge[];
  configuredSource: 'api' | 'static';
  usedFallback: boolean;
  apiReachable: boolean | null;
}

export async function loadGraphData(): Promise<GraphLoadResult> {
  const configuredSource = getGraphDataSource();

  if (configuredSource === 'api') {
    const apiReachable = await fetchApiHealth();
    if (apiReachable) {
      try {
        const { nodes, edges } = await fetchGraphFromApi();
        return {
          graphNodes: nodes,
          graphEdges: edges,
          configuredSource,
          usedFallback: false,
          apiReachable: true,
        };
      } catch (err) {
        console.warn('[graph] API graph fetch failed, falling back:', err);
      }
    }
    const { graphNodes, graphEdges } = getStandardizedViewGraph();
    assertStandardizedGraphCounts(graphNodes, graphEdges);
    return {
      graphNodes,
      graphEdges,
      configuredSource,
      usedFallback: true,
      apiReachable: apiReachable,
    };
  }

  const { graphNodes, graphEdges } = getStandardizedViewGraph();
  assertStandardizedGraphCounts(graphNodes, graphEdges);
  return {
    graphNodes,
    graphEdges,
    configuredSource,
    usedFallback: false,
    apiReachable: null,
  };
}

export function getGraphDataSourceLabel(meta: GraphLoadResult): string {
  if (meta.configuredSource === 'static') {
    return 'KG 标准化 · 静态';
  }
  if (meta.usedFallback) {
    return 'KG 标准化 · API 不可用';
  }
  return 'API · SQLite';
}

export function shouldUseApiPaths(meta: GraphLoadResult): boolean {
  return meta.configuredSource === 'api' && !meta.usedFallback;
}
