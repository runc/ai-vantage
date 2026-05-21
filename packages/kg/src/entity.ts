import { z } from 'zod';
import { EntityType, RecordStatus } from './enums';

export const entityTypeSchema = z.enum([
  EntityType.Domain,
  EntityType.Theme,
  EntityType.Industry,
  EntityType.SubIndustry,
  EntityType.SupplyChainStage,
  EntityType.Company,
  EntityType.Instrument,
  EntityType.Product,
  EntityType.Technology,
  EntityType.Event,
  EntityType.Metric,
  EntityType.Document,
]);

export const recordStatusSchema = z.enum([
  RecordStatus.draft,
  RecordStatus.extracted,
  RecordStatus.candidate,
  RecordStatus.verified,
  RecordStatus.active,
  RecordStatus.rejected,
  RecordStatus.deprecated,
  RecordStatus.merged,
]);

export const entitySchema = z.object({
  id: z.string().min(1),
  type: entityTypeSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  aliases: z.array(z.string()).default([]),
  description: z.string().optional(),
  properties: z.record(z.unknown()).default({}),
  status: recordStatusSchema.default(RecordStatus.active),
  source: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Entity = z.infer<typeof entitySchema>;

export type CreateEntityInput = z.input<typeof entitySchema>;
