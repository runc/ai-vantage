import {
  pgTable,
  text,
  timestamp,
  jsonb,
  real,
  index,
} from 'drizzle-orm/pg-core';

export const relations = pgTable(
  'relations',
  {
    id: text('id').primaryKey(),
    subjectEntityId: text('subject_entity_id').notNull(),
    predicate: text('predicate').notNull(),
    objectEntityId: text('object_entity_id').notNull(),
    properties: jsonb('properties').$type<Record<string, unknown>>().notNull().default({}),
    confidence: real('confidence').notNull().default(1),
    status: text('status').notNull().default('active'),
    label: text('label'),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('relations_subject_idx').on(table.subjectEntityId),
    index('relations_object_idx').on(table.objectEntityId),
    index('relations_predicate_idx').on(table.predicate),
    index('relations_status_idx').on(table.status),
  ],
);
