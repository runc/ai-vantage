import { z } from 'zod';
import { RelationPredicate, RecordStatus } from './enums';

export const relationPredicateSchema = z.enum([
  RelationPredicate.belongs_to,
  RelationPredicate.contains,
  RelationPredicate.listed_as,
  RelationPredicate.produces,
  RelationPredicate.supplies_to,
  RelationPredicate.customer_of,
  RelationPredicate.competes_with,
  RelationPredicate.upstream_of,
  RelationPredicate.downstream_of,
  RelationPredicate.depends_on,
  RelationPredicate.enables,
  RelationPredicate.benefits_from,
  RelationPredicate.hurt_by,
  RelationPredicate.affected_by,
  RelationPredicate.mentions,
  RelationPredicate.supports,
  RelationPredicate.contradicts,
  RelationPredicate.changes_metric,
  RelationPredicate.relates_to,
]);

export const relationSchema = z.object({
  id: z.string().min(1),
  subjectEntityId: z.string().min(1),
  predicate: relationPredicateSchema,
  objectEntityId: z.string().min(1),
  properties: z.record(z.unknown()).default({}),
  confidence: z.number().min(0).max(1).default(1),
  status: z.enum([
    RecordStatus.draft,
    RecordStatus.extracted,
    RecordStatus.candidate,
    RecordStatus.verified,
    RecordStatus.active,
    RecordStatus.rejected,
    RecordStatus.deprecated,
  ]).default(RecordStatus.active),
  label: z.string().optional(),
  validFrom: z.coerce.date().optional(),
  validTo: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Relation = z.infer<typeof relationSchema>;

export type CreateRelationInput = z.input<typeof relationSchema>;
