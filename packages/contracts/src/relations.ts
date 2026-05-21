import { z } from 'zod';

export const relationDtoSchema = z.object({
  id: z.string(),
  subjectEntityId: z.string(),
  predicate: z.string(),
  objectEntityId: z.string(),
  properties: z.record(z.unknown()).optional(),
  confidence: z.number(),
  status: z.string(),
  label: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createRelationSchema = z.object({
  id: z.string().min(1),
  subjectEntityId: z.string().min(1),
  predicate: z.string().min(1),
  objectEntityId: z.string().min(1),
  properties: z.record(z.unknown()).optional(),
  confidence: z.number().min(0).max(1).default(1),
  status: z.string().default('active'),
  label: z.string().optional(),
});

export const updateRelationSchema = createRelationSchema.partial().omit({ id: true });

export const relationListQuerySchema = z.object({
  status: z.string().optional(),
  entityId: z.string().optional(),
});

export const relationsListResponseSchema = z.object({
  relations: z.array(relationDtoSchema),
});

export type RelationDto = z.infer<typeof relationDtoSchema>;
export type CreateRelationDto = z.infer<typeof createRelationSchema>;
export type UpdateRelationDto = z.infer<typeof updateRelationSchema>;
