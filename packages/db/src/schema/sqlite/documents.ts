import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  sourceUrl: text('source_url'),
  publisher: text('publisher'),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  rawText: text('raw_text'),
  contentHash: text('content_hash'),
  parseStatus: text('parse_status').notNull().default('pending'),
  ingestionStatus: text('ingestion_status').notNull().default('registered'),
  metadata: text('metadata', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});
