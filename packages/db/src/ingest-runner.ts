import { randomUUID } from 'node:crypto';
import { runExtractionPipeline, getExtractorMode } from '@ai-vantage/ai';
import type { ExtractionResult } from '@ai-vantage/ai';
import { RecordStatus, DocumentSourceType } from '@ai-vantage/kg';
import type { Assertion, Evidence } from '@ai-vantage/kg';
import type { Database } from './client.js';
import { DocumentRepository } from './repositories/document-repository.js';
import { ExtractionRepository } from './repositories/extraction-repository.js';
import { AssertionRepository } from './repositories/assertion-repository.js';
import { EvidenceRepository } from './repositories/evidence-repository.js';

export async function runDocumentIngest(
  db: Database,
  documentId: string,
): Promise<{ jobId: string; result: ExtractionResult } | { error: string }> {
  const documents = new DocumentRepository(db);
  const extractions = new ExtractionRepository(db);
  const assertions = new AssertionRepository(db);
  const evidences = new EvidenceRepository(db);

  const doc = await documents.findById(documentId);
  if (!doc) return { error: 'document_not_found' };
  if (!doc.rawText?.trim()) return { error: 'document_has_no_text' };

  const meta = doc.metadata as {
    primaryEntityId?: string;
    relatedEntityIds?: string[];
  };
  const primaryEntityId = meta.primaryEntityId;
  if (!primaryEntityId) return { error: 'missing_primary_entity' };

  const jobId = randomUUID();
  const extractor = getExtractorMode();
  await extractions.create({
    id: jobId,
    documentId,
    status: 'running',
    extractor,
  });
  await documents.update(documentId, { ingestionStatus: 'ingesting' });

  try {
    const existingActive = await assertions.findActiveBySubjectEntityId(primaryEntityId);
    const result = runExtractionPipeline({
      documentId,
      title: doc.title,
      rawText: doc.rawText,
      primaryEntityId,
      relatedEntityIds: meta.relatedEntityIds,
      existingActiveAssertions: existingActive,
    });

    for (const ev of result.evidences) {
      if (!(await evidences.findById(ev.id))) {
        await evidences.create({
          id: ev.id,
          documentId,
          sourceType: DocumentSourceType.platform_article,
          sourceTitle: ev.sourceTitle,
          evidenceSpan: ev.evidenceSpan,
          reliabilityScore: ev.reliabilityScore,
        });
      }
    }

    for (const a of result.assertions) {
      if (await assertions.findById(a.id)) continue;
      await assertions.create({
        id: a.id,
        subjectEntityId: a.subjectEntityId,
        predicate: a.predicate as Assertion['predicate'],
        objectEntityId: a.objectEntityId,
        claimText: a.claimText,
        confidence: a.confidence,
        status: RecordStatus.candidate,
        evidenceIds: [a.evidenceId],
        generatedBy: `ai:${result.extractor}`,
      });
    }

    await extractions.update(jobId, {
      status: 'completed',
      result,
      completedAt: new Date(),
    });
    await documents.update(documentId, {
      ingestionStatus: 'completed',
      parseStatus: 'parsed',
    });

    return { jobId, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await extractions.update(jobId, {
      status: 'failed',
      error: message,
      completedAt: new Date(),
    });
    await documents.update(documentId, { ingestionStatus: 'failed' });
    return { error: message };
  }
}
