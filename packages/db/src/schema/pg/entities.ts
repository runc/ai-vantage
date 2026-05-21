import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

export const entities = pgTable(
  'entities',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    aliases: jsonb('aliases').$type<string[]>().notNull().default([]),
    description: text('description'),
    properties: jsonb('properties').$type<Record<string, unknown>>().notNull().default({}),
    status: text('status').notNull().default('active'),
    source: text('source'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('entities_type_idx').on(table.type),
    index('entities_slug_idx').on(table.slug),
    index('entities_status_idx').on(table.status),
  ],
);
