import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const graphSnapshots = sqliteTable('graph_snapshots', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  scope: text('scope'),
  entityCount: integer('entity_count').notNull().default(0),
  relationCount: integer('relation_count').notNull().default(0),
  assertionCount: integer('assertion_count').notNull().default(0),
  snapshotData: text('snapshot_data', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});
