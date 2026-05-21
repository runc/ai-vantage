import { eq, and, desc } from 'drizzle-orm';
import type { Database } from '../client.js';
import { getTables } from '../schema/index.js';

export interface AuditLogEntry {
  id: string;
  actorType: string;
  actorId?: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

export class AuditLogRepository {
  constructor(private db: Database) {}

  async insert(entry: AuditLogEntry): Promise<void> {
    const { auditLogs } = getTables();
    await this.db.insert(auditLogs).values({
      id: entry.id,
      actorType: entry.actorType,
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      before: entry.before ?? null,
      after: entry.after ?? null,
      reason: entry.reason ?? null,
      createdAt: entry.createdAt,
    });
  }

  async findMany(params: {
    targetType?: string;
    targetId?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const { auditLogs } = getTables();
    const conditions = [];
    if (params.targetType) conditions.push(eq(auditLogs.targetType, params.targetType));
    if (params.targetId) conditions.push(eq(auditLogs.targetId, params.targetId));

    const query = this.db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(params.limit ?? 50);

    const rows =
      conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

    return rows.map((row) => ({
      id: row.id,
      actorType: row.actorType,
      actorId: row.actorId ?? undefined,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      before: row.before ?? undefined,
      after: row.after ?? undefined,
      reason: row.reason ?? undefined,
      createdAt: row.createdAt,
    }));
  }
}
