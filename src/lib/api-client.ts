import type {
  GraphQueryResponse,
  GraphViewData,
  ViewNode,
  ViewEdge,
} from '@ai-vantage/contracts';

const DEFAULT_API_URL = 'http://localhost:3001';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? DEFAULT_API_URL;
}

function getRevalidateSeconds(): number {
  if (process.env.NODE_ENV === 'development') return 0;
  return 60;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    next: { revalidate: getRevalidateSeconds() },
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function dtoToViewGraph(data: GraphQueryResponse): GraphViewData {
  const nodes: ViewNode[] = data.entities
    .filter((e) => e.legacyNodeType)
    .map((e) => ({
      id: e.id,
      type: e.legacyNodeType!,
      label: e.name,
      data: e.properties,
    }));

  const edges: ViewEdge[] = data.relations
    .filter((r) => r.legacyEdgeType)
    .map((r) => ({
      source: r.subjectEntityId,
      target: r.objectEntityId,
      type: r.legacyEdgeType!,
      label: r.label ?? r.predicate,
    }));

  return { nodes, edges };
}

export async function fetchGraphFromApi(): Promise<GraphViewData> {
  const data = await fetchJson<GraphQueryResponse>('/graph');
  return dtoToViewGraph(data);
}

export async function fetchGraphPathFromApi(
  startId: string,
  endId: string,
  maxDepth = 5,
): Promise<string[][]> {
  const params = new URLSearchParams({
    startId,
    endId,
    maxDepth: String(maxDepth),
  });
  const data = await fetchJson<{ paths: string[][] }>(`/graph/path?${params}`);
  return data.paths;
}

/** Server-side API health probe (graph page). */
export async function fetchApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function getGraphDataSource(): 'api' | 'static' {
  const source = process.env.GRAPH_DATA_SOURCE ?? 'static';
  return source === 'api' ? 'api' : 'static';
}

/** Client-side path query (path finder in browser). */
export async function fetchGraphPathClient(
  startId: string,
  endId: string,
  maxDepth = 5,
): Promise<string[][]> {
  const params = new URLSearchParams({
    startId,
    endId,
    maxDepth: String(maxDepth),
  });
  const res = await fetch(`${getApiBaseUrl()}/graph/path?${params}`);
  if (!res.ok) {
    throw new Error(`Path API failed: ${res.status}`);
  }
  const data = (await res.json()) as { paths: string[][] };
  return data.paths;
}
