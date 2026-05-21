import { Hono } from 'hono';
import {
  createEntitySchema,
  updateEntitySchema,
  entityListQuerySchema,
} from '@ai-vantage/contracts';
import type { EntityService } from '../services/entity-service.js';
import type { AssertionService } from '../services/assertion-service.js';
import { getActor } from '../lib/actor.js';

export function createEntityRoutes(
  service: EntityService,
  assertionService?: AssertionService,
) {
  const app = new Hono();

  app.get('/', async (c) => {
    const query = entityListQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: query.error.flatten() }, 400);
    const entities = await service.list(query.data);
    return c.json({ entities });
  });

  app.get('/:id/assertions', async (c) => {
    if (!assertionService) return c.json({ error: 'not_configured' }, 501);
    const status = c.req.query('status');
    const assertions = await assertionService.getByEntityId(c.req.param('id'), status);
    return c.json({ assertions });
  });

  app.get('/:id', async (c) => {
    const entity = await service.getById(c.req.param('id'));
    if (!entity) return c.json({ error: 'not_found' }, 404);
    return c.json(entity);
  });

  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createEntitySchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const entity = await service.create(parsed.data, getActor(c));
    return c.json(entity, 201);
  });

  app.patch('/:id', async (c) => {
    const body = await c.req.json();
    const parsed = updateEntitySchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const entity = await service.update(c.req.param('id'), parsed.data, getActor(c));
    if (!entity) return c.json({ error: 'not_found' }, 404);
    return c.json(entity);
  });

  app.post('/:id/deprecate', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { reason?: string };
    const entity = await service.deprecate(c.req.param('id'), getActor(c), body.reason);
    if (!entity) return c.json({ error: 'not_found' }, 404);
    return c.json(entity);
  });

  return app;
}
