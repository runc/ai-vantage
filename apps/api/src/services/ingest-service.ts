import {
  type Database,
  DocumentRepository,
  ExtractionRepository,
  runDocumentIngest,
  AuditService,
  type Actor,
} from '@ai-vantage/db';
import type { ExtractionJobDto } from '@ai-vantage/contracts';

function extractionToDto(
  job: Awaited<ReturnType<ExtractionRepository['findById']>>,
): ExtractionJobDto | null {
  if (!job) return null;
  const r = job.result;
  return {
    id: job.id,
    documentId: job.documentId,
    status: job.status,
    extractor: job.extractor,
    error: job.error ?? null,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
    result: r
      ? {
          extractor: r.extractor,
          assertionCount: r.assertions.length,
          evidenceCount: r.evidences.length,
          conflictCount: r.conflicts.length,
          conflicts: r.conflicts,
          createdAssertionIds: r.assertions.map((a) => a.id),
        }
      : undefined,
  };
}

export class IngestService {
  private extractions: ExtractionRepository;

  constructor(
    private db: Database,
    private audit: AuditService,
  ) {
    this.extractions = new ExtractionRepository(db);
  }

  async listExtractions(documentId: string): Promise<ExtractionJobDto[]> {
    const jobs = await this.extractions.findByDocumentId(documentId);
    return jobs.map((j) => extractionToDto(j)!).filter(Boolean);
  }

  async ingest(documentId: string, actor: Actor): Promise<ExtractionJobDto | { error: string }> {
    const outcome = await runDocumentIngest(this.db, documentId);
    if ('error' in outcome) return { error: outcome.error };

    const job = await this.extractions.findById(outcome.jobId);
    if (job) {
      await this.audit.log({
        actor,
        action: 'ingest',
        targetType: 'document',
        targetId: documentId,
        after: {
          jobId: outcome.jobId,
          assertionCount: outcome.result.assertions.length,
          conflictCount: outcome.result.conflicts.length,
        },
      });
    }
    const dto = extractionToDto(job);
    return dto ?? { error: 'job_not_found' };
  }
}
