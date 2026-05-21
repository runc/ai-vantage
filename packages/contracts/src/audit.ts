import { z } from 'zod';

export const auditLogDtoSchema = z.object({
  id: z.string(),
  actorType: z.string(),
  actorId: z.string().nullable().optional(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  before: z.record(z.unknown()).nullable().optional(),
  after: z.record(z.unknown()).nullable().optional(),
  reason: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const auditLogQuerySchema = z.object({
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const auditLogsListResponseSchema = z.object({
  logs: z.array(auditLogDtoSchema),
});
