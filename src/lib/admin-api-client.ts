import type {
  AssertionDto,
  EvidenceDto,
  AssertionsListResponse,
  DocumentDto,
  ExtractionJobDto,
} from '@ai-vantage/contracts';
import { getApiBaseUrl } from './api-client';

const ACTOR_ID = 'web-reviewer';

function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Actor-Id': ACTOR_ID,
  };
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...adminHeaders(), ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAssertions(params?: {
  status?: string;
  subjectEntityId?: string;
}): Promise<AssertionDto[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.subjectEntityId) qs.set('subjectEntityId', params.subjectEntityId);
  const suffix = qs.size ? `?${qs}` : '';
  const data = await adminFetch<AssertionsListResponse>(`/assertions${suffix}`);
  return data.assertions;
}

export async function fetchEvidencesByIds(ids: string[]): Promise<EvidenceDto[]> {
  if (ids.length === 0) return [];
  const all = await adminFetch<{ evidences: EvidenceDto[] }>('/evidences?limit=200');
  const set = new Set(ids);
  return all.evidences.filter((e) => set.has(e.id));
}

export async function fetchEntityAssertions(
  entityId: string,
  status?: string,
): Promise<AssertionDto[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await adminFetch<{ assertions: AssertionDto[] }>(
    `/entities/${entityId}/assertions${qs}`,
  );
  return data.assertions;
}

export async function verifyAssertion(id: string): Promise<AssertionDto> {
  return adminFetch<AssertionDto>(`/assertions/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify({ reviewedBy: ACTOR_ID }),
  });
}

export async function rejectAssertion(id: string, reason?: string): Promise<AssertionDto> {
  return adminFetch<AssertionDto>(`/assertions/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason, reviewedBy: ACTOR_ID }),
  });
}

export async function deprecateAssertion(id: string, reason?: string): Promise<AssertionDto> {
  return adminFetch<AssertionDto>(`/assertions/${id}/deprecate`, {
    method: 'POST',
    body: JSON.stringify({ reason, reviewedBy: ACTOR_ID }),
  });
}

export async function fetchDocuments(): Promise<DocumentDto[]> {
  const data = await adminFetch<{ documents: DocumentDto[] }>('/documents');
  return data.documents;
}

export async function registerDocumentFromMdx(
  kind: 'targets' | 'layers' | 'concepts',
  slug: string,
): Promise<DocumentDto> {
  return adminFetch<DocumentDto>('/documents/from-mdx', {
    method: 'POST',
    body: JSON.stringify({ kind, slug }),
  });
}

export async function ingestDocument(documentId: string): Promise<ExtractionJobDto> {
  return adminFetch<ExtractionJobDto>(`/documents/${documentId}/ingest`, {
    method: 'POST',
    body: '{}',
  });
}

export async function fetchDocumentExtractions(
  documentId: string,
): Promise<ExtractionJobDto[]> {
  const data = await adminFetch<{ extractions: ExtractionJobDto[] }>(
    `/documents/${documentId}/extractions`,
  );
  return data.extractions;
}
