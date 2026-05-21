import { Hono } from 'hono';
import {
  createAssertionSchema,
  updateAssertionSchema,
  assertionListQuerySchema,
  reviewActionSchema,
  linkEvidenceSchema,
} from '@ai-vantage/contracts';
import type { AssertionService } from '../services/assertion-service.js';
import { getActor } from '../lib/actor.js';

export function createAssertionRoutes(service: AssertionService) {
  const app = new Hono();

  app.get('/', async (c) => {
    const query = assertionListQuerySchema.safeParse(c.req.query());
    if (!query.success) return c.json({ error: query.error.flatten() }, 400);
    const entityIds = query.data.entityIds
      ? query.data.entityIds.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const assertions = await service.list({
      status: query.data.status,
      subjectEntityId: query.data.subjectEntityId,
      entityIds,
      limit: query.data.limit,
    });
    return c.json({ assertions });
  });

  app.get('/:id', async (c) => {
    const assertion = await service.getById(c.req.param('id'));
    if (!assertion) return c.json({ error: 'not_found' }, 404);
    return c.json(assertion);
  });

  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createAssertionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const assertion = await service.create(parsed.data, getActor(c));
    return c.json(assertion, 201);
  });

  app.patch('/:id', async (c) => {
    const body = await c.req.json();
    const parsed = updateAssertionSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const assertion = await service.update(c.req.param('id'), parsed.data, getActor(c));
    if (!assertion) return c.json({ error: 'not_found' }, 404);
    return c.json(assertion);
  });

  app.post('/:id/verify', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as unknown;
    const parsed = reviewActionSchema.safeParse(body);
    const reviewedBy = parsed.success ? parsed.data.reviewedBy : undefined;
    const assertion = await service.verify(c.req.param('id'), getActor(c), reviewedBy);
    if (!assertion) return c.json({ error: 'not_found' }, 404);
    return c.json(assertion);
  });

  app.post('/:id/reject', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as unknown;
    const parsed = reviewActionSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;
    const assertion = await service.reject(c.req.param('id'), getActor(c), reason);
    if (!assertion) return c.json({ error: 'not_found' }, 404);
    return c.json(assertion);
  });

  app.post('/:id/deprecate', async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as unknown;
    const parsed = reviewActionSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;
    const assertion = await service.deprecate(c.req.param('id'), getActor(c), reason);
    if (!assertion) return c.json({ error: 'not_found' }, 404);
    return c.json(assertion);
  });

  app.post('/:id/link-evidence', async (c) => {
    const body = await c.req.json();
    const parsed = linkEvidenceSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const result = await service.linkEvidence(
      c.req.param('id'),
      parsed.data.evidenceId,
      getActor(c),
    );
    if (!result) return c.json({ error: 'not_found' }, 404);
    if ('error' in result) return c.json({ error: result.error }, 404);
    return c.json(result);
  });

  return app;
}
