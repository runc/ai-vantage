import { Hono } from 'hono';
import { createEvidenceSchema } from '@ai-vantage/contracts';
import type { EvidenceService } from '../services/evidence-service.js';
import { getActor } from '../lib/actor.js';

export function createEvidenceRoutes(service: EvidenceService) {
  const app = new Hono();

  app.get('/', async (c) => {
    const limit = Number(c.req.query('limit') ?? 100);
    const evidences = await service.list(limit);
    return c.json({ evidences });
  });

  app.get('/:id', async (c) => {
    const evidence = await service.getById(c.req.param('id'));
    if (!evidence) return c.json({ error: 'not_found' }, 404);
    return c.json(evidence);
  });

  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createEvidenceSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const evidence = await service.create(parsed.data, getActor(c));
    return c.json(evidence, 201);
  });

  return app;
}
