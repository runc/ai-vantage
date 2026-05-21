import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  sourceType: text('source_type').notNull(),
  sourceUrl: text('source_url'),
  publisher: text('publisher'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  rawText: text('raw_text'),
  contentHash: text('content_hash'),
  parseStatus: text('parse_status').notNull().default('pending'),
  ingestionStatus: text('ingestion_status').notNull().default('registered'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
