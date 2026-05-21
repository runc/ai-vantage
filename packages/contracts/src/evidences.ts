import { z } from 'zod';

export const evidenceDtoSchema = z.object({
  id: z.string(),
  documentId: z.string().nullable().optional(),
  sourceType: z.string(),
  sourceTitle: z.string(),
  sourceUrl: z.string().nullable().optional(),
  publisher: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  evidenceSpan: z.string().nullable().optional(),
  pageNumber: z.number().nullable().optional(),
  reliabilityScore: z.number(),
  createdAt: z.string().optional(),
});

export const createEvidenceSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().optional(),
  sourceType: z.string().min(1),
  sourceTitle: z.string().min(1),
  sourceUrl: z.string().optional(),
  publisher: z.string().optional(),
  evidenceSpan: z.string().optional(),
  reliabilityScore: z.number().min(0).max(1).default(0.7),
});

export const evidencesListResponseSchema = z.object({
  evidences: z.array(evidenceDtoSchema),
});

export type EvidenceDto = z.infer<typeof evidenceDtoSchema>;
export type CreateEvidenceDto = z.infer<typeof createEvidenceSchema>;
