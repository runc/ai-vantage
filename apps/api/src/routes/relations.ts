import { Hono } from 'hono';
import {
  createRelationSchema,
  updateRelationSchema,
  relationListQuerySchema,
} from '@ai-vantage/contracts';
import type { RelationService } from '../services/relation-service.js';
import { getActor } from '../lib/actor.js';

export function createRelationRoutes(service: RelationService) {
  const app = new Hono();

  app.get('/', async (c) => {
    const query = relationListQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: query.error.flatten() }, 400);
    const relations = await service.list(query.data);
    return c.json({ relations });
  });

  app.get('/:id', async (c) => {
    const relation = await service.getById(c.req.param('id'));
    if (!relation) return c.json({ error: 'not_found' }, 404);
    return c.json(relation);
  });

  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createRelationSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const relation = await service.create(parsed.data, getActor(c));
    return c.json(relation, 201);
  });

  app.patch('/:id', async (c) => {
    const body = await c.req.json();
    const parsed = updateRelationSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const relation = await service.update(c.req.param('id'), parsed.data, getActor(c));
    if (!relation) return c.json({ error: 'not_found' }, 404);
    return c.json(relation);
  });

  app.post('/:id/deprecate', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { reason?: string };
    const relation = await service.deprecate(c.req.param('id'), getActor(c), body.reason);
    if (!relation) return c.json({ error: 'not_found' }, 404);
    return c.json(relation);
  });

  return app;
}
