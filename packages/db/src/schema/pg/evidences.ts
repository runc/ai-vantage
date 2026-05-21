import { pgTable, text, timestamp, real, integer } from 'drizzle-orm/pg-core';

export const evidences = pgTable('evidences', {
  id: text('id').primaryKey(),
  documentId: text('document_id'),
  sourceType: text('source_type').notNull(),
  sourceTitle: text('source_title').notNull(),
  sourceUrl: text('source_url'),
  publisher: text('publisher'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  evidenceSpan: text('evidence_span'),
  pageNumber: integer('page_number'),
  reliabilityScore: real('reliability_score').notNull().default(0.5),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
