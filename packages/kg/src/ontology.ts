import { z } from 'zod';
import { OntologyKind, RecordStatus } from './enums';

export const ontologyTypeSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    OntologyKind.entity_type,
    OntologyKind.relation_type,
    OntologyKind.attribute_schema,
    OntologyKind.hierarchy_rule,
    OntologyKind.review_policy,
  ]),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  schema: z.record(z.unknown()).default({}),
  constraints: z.record(z.unknown()).default({}),
  status: z.enum([
    RecordStatus.draft,
    RecordStatus.active,
    RecordStatus.deprecated,
  ]).default(RecordStatus.active),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type OntologyType = z.infer<typeof ontologyTypeSchema>;
