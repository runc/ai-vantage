import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import type { ExtractionResult } from '@ai-vantage/ai';

export const documentExtractions = pgTable(
  'document_extractions',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id').notNull(),
    status: text('status').notNull().default('pending'),
    extractor: text('extractor').notNull().default('stub'),
    result: jsonb('result').$type<ExtractionResult>(),
    error: text('error'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => [index('document_extractions_doc_idx').on(table.documentId)],
);
