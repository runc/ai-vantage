import { pgTable, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const graphSnapshots = pgTable('graph_snapshots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  scope: text('scope'),
  entityCount: integer('entity_count').notNull().default(0),
  relationCount: integer('relation_count').notNull().default(0),
  assertionCount: integer('assertion_count').notNull().default(0),
  snapshotData: jsonb('snapshot_data').$type<Record<string, unknown>>().notNull().default({}),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
