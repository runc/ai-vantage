import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const entities = sqliteTable(
  'entities',
  {
    id: text('id').primaryKey(),
    type: text('type').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    aliases: text('aliases', { mode: 'json' }).$type<string[]>().notNull().default([]),
    description: text('description'),
    properties: text('properties', { mode: 'json' })
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    status: text('status').notNull().default('active'),
    source: text('source'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index('entities_type_idx').on(table.type),
    index('entities_slug_idx').on(table.slug),
    index('entities_status_idx').on(table.status),
  ],
);
