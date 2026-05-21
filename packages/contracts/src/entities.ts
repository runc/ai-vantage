import { z } from 'zod';

export const entityDtoSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
  properties: z.record(z.unknown()).optional(),
  status: z.string(),
  source: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createEntitySchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  description: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
  status: z.string().default('active'),
  source: z.string().optional(),
});

export const updateEntitySchema = createEntitySchema.partial().omit({ id: true });

export const entityListQuerySchema = z.object({
  status: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const entitiesListResponseSchema = z.object({
  entities: z.array(entityDtoSchema),
});

export type EntityDto = z.infer<typeof entityDtoSchema>;
export type CreateEntityDto = z.infer<typeof createEntitySchema>;
export type UpdateEntityDto = z.infer<typeof updateEntitySchema>;
