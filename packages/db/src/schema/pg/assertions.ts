import { pgTable, text, timestamp, real, jsonb, index } from 'drizzle-orm/pg-core';

export const assertions = pgTable(
  'assertions',
  {
    id: text('id').primaryKey(),
    subjectEntityId: text('subject_entity_id').notNull(),
    predicate: text('predicate').notNull(),
    objectEntityId: text('object_entity_id'),
    claimText: text('claim_text').notNull(),
    confidence: real('confidence').notNull().default(0.5),
    status: text('status').notNull().default('candidate'),
    evidenceIds: jsonb('evidence_ids').$type<string[]>().notNull().default([]),
    generatedBy: text('generated_by'),
    reviewedBy: text('reviewed_by'),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('assertions_status_idx').on(table.status)],
);
