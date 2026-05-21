import { Hono } from 'hono';
import { auditLogQuerySchema } from '@ai-vantage/contracts';
import { AuditLogRepository } from '@ai-vantage/db';
import { auditLogToDto } from '../lib/dto-mappers.js';

export function createAuditLogRoutes(repo: AuditLogRepository) {
  const app = new Hono();

  app.get('/', async (c) => {
    const query = auditLogQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: query.error.flatten() }, 400);
    const logs = await repo.findMany(query.data);
    return c.json({ logs: logs.map(auditLogToDto) });
  });

  return app;
}
