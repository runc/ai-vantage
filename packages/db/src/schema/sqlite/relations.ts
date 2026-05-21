import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const relations = sqliteTable(
  'relations',
  {
    id: text('id').primaryKey(),
    subjectEntityId: text('subject_entity_id').notNull(),
    predicate: text('predicate').notNull(),
    objectEntityId: text('object_entity_id').notNull(),
    properties: text('properties', { mode: 'json' })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    confidence: real('confidence').notNull().default(1),
    status: text('status').notNull().default('active'),
    label: text('label'),
    validFrom: integer('valid_from', { mode: 'timestamp_ms' }),
    validTo: integer('valid_to', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('relations_subject_idx').on(table.subjectEntityId),
    index('relations_object_idx').on(table.objectEntityId),
    index('relations_predicate_idx').on(table.predicate),
    index('relations_status_idx').on(table.status),
  ],
);
