import { z } from 'zod';
import { relationPredicateSchema } from './relation';
import { RecordStatus } from './enums';

export const assertionSchema = z.object({
  id: z.string().min(1),
  subjectEntityId: z.string().min(1),
  predicate: relationPredicateSchema,
  objectEntityId: z.string().optional(),
  claimText: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  status: z.enum([
    RecordStatus.extracted,
    RecordStatus.candidate,
    RecordStatus.verified,
    RecordStatus.active,
    RecordStatus.rejected,
    RecordStatus.deprecated,
  ]).default(RecordStatus.candidate),
  evidenceIds: z.array(z.string()).default([]),
  generatedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Assertion = z.infer<typeof assertionSchema>;
