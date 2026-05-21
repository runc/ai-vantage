import { executeExplore, EXPLORE_PRESETS } from '@ai-vantage/kg';
import type { ExploreResponse, AssertionDto } from '@ai-vantage/contracts';
import type { GraphNode, GraphEdge } from '@/lib/types';
import { getApiBaseUrl } from './api-client';

export { EXPLORE_PRESETS };

export interface LocalExploreResult {
  parse: ExploreResponse['parse'];
  parser: 'rule' | 'llm';
  nodeIds: Set<string>;
  relationIds: Set<string>;
  paths?: string[][];
}

function toExploreEntities(nodes: GraphNode[]) {
  return nodes.map((n) => {
    const data = (n.data ?? {}) as Record<string, unknown>;
    return {
      id: n.id,
      name: n.label,
      legacyNodeType: n.type,
      properties: {
        ...data,
        titleZh: data.titleZh as string | undefined,
      },
    };
  });
}

function toExploreRelations(edges: GraphEdge[]) {
  return edges.map((e, i) => ({
    id: `${e.source}-${e.target}-${e.type}-${i}`,
    source: e.source,
    target: e.target,
    type: e.type,
  }));
}

export function runLocalExplore(
  query: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): LocalExploreResult {
  const result = executeExplore(
    query,
    toExploreEntities(nodes),
    toExploreRelations(edges),
  );
  return {
    parse: result.parse,
    parser: 'rule',
    nodeIds: new Set(result.nodeIds),
    relationIds: new Set(result.relationIds),
    paths: result.paths,
  };
}

export async function fetchGraphExploreClient(
  query: string,
  options?: { useLlm?: boolean },
): Promise<ExploreResponse> {
  const params = new URLSearchParams({ q: query });
  if (options?.useLlm) params.set('llm', 'true');
  const res = await fetch(`${getApiBaseUrl()}/graph/explore?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Explore API failed: ${res.status}`);
  }
  return res.json() as Promise<ExploreResponse>;
}

/** Active + candidate assertions for entities in explore scope. */
export async function fetchAssertionsForEntities(
  entityIds: string[],
): Promise<AssertionDto[]> {
  if (entityIds.length === 0) return [];
  const params = new URLSearchParams({
    entityIds: entityIds.join(','),
    limit: '50',
  });
  const res = await fetch(`${getApiBaseUrl()}/assertions?${params}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Assertions API failed: ${res.status}`);
  const data = (await res.json()) as { assertions: AssertionDto[] };
  return data.assertions;
}
