import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const assertions = sqliteTable(
  'assertions',
  {
    id: text('id').primaryKey(),
    subjectEntityId: text('subject_entity_id').notNull(),
    predicate: text('predicate').notNull(),
    objectEntityId: text('object_entity_id'),
    claimText: text('claim_text').notNull(),
    confidence: real('confidence').notNull().default(0.5),
    status: text('status').notNull().default('candidate'),
    evidenceIds: text('evidence_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),
    generatedBy: text('generated_by'),
    reviewedBy: text('reviewed_by'),
    validFrom: integer('valid_from', { mode: 'timestamp_ms' }),
    validTo: integer('valid_to', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index('assertions_status_idx').on(table.status)],
);
