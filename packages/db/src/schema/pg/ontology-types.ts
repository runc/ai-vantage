import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const ontologyTypes = pgTable('ontology_types', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description'),
  schema: jsonb('schema').$type<Record<string, unknown>>().notNull().default({}),
  constraints: jsonb('constraints').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
