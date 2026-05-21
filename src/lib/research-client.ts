import type {
  ResearchIndexResponse,
  DomainViewResponse,
  ThemeViewResponse,
  InstrumentViewResponse,
  EventViewResponse,
  ExploreResponse,
} from '@ai-vantage/contracts';
import { getApiBaseUrl } from './api-client';

async function researchFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchResearchIndex(): Promise<ResearchIndexResponse> {
  return researchFetch<ResearchIndexResponse>('/research');
}

export async function fetchDomainView(slug: string): Promise<DomainViewResponse> {
  return researchFetch<DomainViewResponse>(`/research/domains/${encodeURIComponent(slug)}`);
}

export async function fetchThemeView(slug: string): Promise<ThemeViewResponse> {
  return researchFetch<ThemeViewResponse>(`/research/themes/${encodeURIComponent(slug)}`);
}

export async function fetchInstrumentView(symbol: string): Promise<InstrumentViewResponse> {
  return researchFetch<InstrumentViewResponse>(
    `/research/instruments/${encodeURIComponent(symbol)}`,
  );
}

export async function fetchEventView(id: string): Promise<EventViewResponse> {
  return researchFetch<EventViewResponse>(`/research/events/${encodeURIComponent(id)}`);
}

export async function agentQueryGraph(
  query: string,
  options?: { llm?: boolean },
): Promise<{ explore: ExploreResponse; graph: ExploreResponse['graph'] }> {
  return researchFetch('/agent-tools/query-graph', {
    method: 'POST',
    body: JSON.stringify({ query, llm: options?.llm }),
  });
}

export async function agentGenerateBrief(
  scope: 'domain' | 'theme' | 'instrument' | 'event',
  id: string,
): Promise<{ markdown: string }> {
  return researchFetch('/agent-tools/generate-brief', {
    method: 'POST',
    body: JSON.stringify({ scope, id }),
  });
}

export async function fetchResearchApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/research`, {
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  }
}
