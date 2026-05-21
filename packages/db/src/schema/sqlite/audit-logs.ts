import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actorType: text('actor_type').notNull(),
    actorId: text('actor_id'),
    action: text('action').notNull(),
    targetType: text('target_type').notNull(),
    targetId: text('target_id').notNull(),
    before: text('before', { mode: 'json' }).$type<Record<string, unknown>>(),
    after: text('after', { mode: 'json' }).$type<Record<string, unknown>>(),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [index('audit_logs_target_idx').on(table.targetType, table.targetId)],
);
