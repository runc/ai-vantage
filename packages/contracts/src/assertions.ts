import { z } from 'zod';

export const assertionDtoSchema = z.object({
  id: z.string(),
  subjectEntityId: z.string(),
  predicate: z.string(),
  objectEntityId: z.string().nullable().optional(),
  claimText: z.string(),
  confidence: z.number(),
  status: z.string(),
  evidenceIds: z.array(z.string()),
  generatedBy: z.string().nullable().optional(),
  reviewedBy: z.string().nullable().optional(),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  subjectName: z.string().optional(),
  objectName: z.string().optional(),
});

export const createAssertionSchema = z.object({
  id: z.string().min(1),
  subjectEntityId: z.string().min(1),
  predicate: z.string().min(1),
  objectEntityId: z.string().optional(),
  claimText: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  status: z.enum(['extracted', 'candidate', 'verified', 'active', 'rejected', 'deprecated']).default('candidate'),
  evidenceIds: z.array(z.string()).default([]),
  generatedBy: z.string().optional(),
});

export const updateAssertionSchema = createAssertionSchema.partial().omit({ id: true });

export const assertionListQuerySchema = z.object({
  status: z.string().optional(),
  subjectEntityId: z.string().optional(),
  /** Comma-separated entity ids */
  entityIds: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const assertionsListResponseSchema = z.object({
  assertions: z.array(assertionDtoSchema),
});

export const reviewActionSchema = z.object({
  reviewedBy: z.string().optional(),
  reason: z.string().optional(),
});

export const linkEvidenceSchema = z.object({
  evidenceId: z.string().min(1),
});

export type AssertionDto = z.infer<typeof assertionDtoSchema>;
export type CreateAssertionDto = z.infer<typeof createAssertionSchema>;
export type UpdateAssertionDto = z.infer<typeof updateAssertionSchema>;
export type AssertionsListResponse = z.infer<typeof assertionsListResponseSchema>;
