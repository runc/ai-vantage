import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const evidences = sqliteTable('evidences', {
  id: text('id').primaryKey(),
  documentId: text('document_id'),
  sourceType: text('source_type').notNull(),
  sourceTitle: text('source_title').notNull(),
  sourceUrl: text('source_url'),
  publisher: text('publisher'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  evidenceSpan: text('evidence_span'),
  pageNumber: integer('page_number'),
  reliabilityScore: real('reliability_score').notNull().default(0.5),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});
