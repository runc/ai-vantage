import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import type { ExtractionResult } from '@ai-vantage/ai';

export const documentExtractions = sqliteTable(
  'document_extractions',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id').notNull(),
    status: text('status').notNull().default('pending'),
    extractor: text('extractor').notNull().default('stub'),
    result: text('result', { mode: 'json' }).$type<ExtractionResult>(),
    error: text('error'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  },
  (table) => [index('document_extractions_doc_idx').on(table.documentId)],
);
