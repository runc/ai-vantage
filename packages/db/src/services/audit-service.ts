import { randomUUID } from 'node:crypto';
import { AuditLogRepository, type AuditLogEntry } from '../repositories/audit-log-repository.js';

export interface Actor {
  type: string;
  id: string;
}

export class AuditService {
  constructor(private repo: AuditLogRepository) {}

  async log(params: {
    actor: Actor;
    action: string;
    targetType: string;
    targetId: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
  }): Promise<void> {
    const entry: AuditLogEntry = {
      id: randomUUID(),
      actorType: params.actor.type,
      actorId: params.actor.id,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      before: params.before,
      after: params.after,
      reason: params.reason,
      createdAt: new Date(),
    };
    await this.repo.insert(entry);
  }
}
