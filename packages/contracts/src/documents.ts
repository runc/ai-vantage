import { z } from 'zod';

export const documentDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.string(),
  sourceUrl: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  parseStatus: z.string(),
  ingestionStatus: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sourceType: z.string().min(1),
  sourceUrl: z.string().optional(),
  publisher: z.string().optional(),
  rawText: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const fromMdxDocumentSchema = z.object({
  kind: z.enum(['targets', 'layers', 'concepts']),
  slug: z.string().min(1),
});

export const extractionConflictSchema = z.object({
  candidateAssertionId: z.string(),
  existingAssertionId: z.string(),
  reason: z.string(),
  candidateClaim: z.string(),
  existingClaim: z.string(),
});

export const extractionResultDtoSchema = z.object({
  extractor: z.string(),
  assertionCount: z.number(),
  evidenceCount: z.number(),
  conflictCount: z.number(),
  conflicts: z.array(extractionConflictSchema),
  createdAssertionIds: z.array(z.string()),
});

export const extractionJobDtoSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  status: z.string(),
  extractor: z.string(),
  result: extractionResultDtoSchema.optional(),
  error: z.string().nullable().optional(),
  createdAt: z.string(),
  completedAt: z.string().nullable().optional(),
});

export const documentsListResponseSchema = z.object({
  documents: z.array(documentDtoSchema),
});

export const extractionsListResponseSchema = z.object({
  extractions: z.array(extractionJobDtoSchema),
});

export type DocumentDto = z.infer<typeof documentDtoSchema>;
export type CreateDocumentDto = z.infer<typeof createDocumentSchema>;
export type ExtractionJobDto = z.infer<typeof extractionJobDtoSchema>;
