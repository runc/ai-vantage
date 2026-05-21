import { Hono } from 'hono';
import type { ResearchService } from '../services/research-service.js';

export function createResearchRoutes(service: ResearchService) {
  const app = new Hono();

  app.get('/', async (c) => {
    const index = await service.getIndex();
    return c.json(index);
  });

  app.get('/domains/:slug', async (c) => {
    const view = await service.getDomainView(c.req.param('slug'));
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json(view);
  });

  app.get('/themes/:slug', async (c) => {
    const view = await service.getThemeView(c.req.param('slug'));
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json(view);
  });

  app.get('/instruments/:symbol', async (c) => {
    const view = await service.getInstrumentView(c.req.param('symbol'));
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json(view);
  });

  app.get('/events/:id', async (c) => {
    const view = await service.getEventView(c.req.param('id'));
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json(view);
  });

  return app;
}
