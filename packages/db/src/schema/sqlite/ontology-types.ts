import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const ontologyTypes = sqliteTable('ontology_types', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  schema: text('schema', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  constraints: text('constraints', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});
