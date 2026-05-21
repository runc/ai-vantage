import { Hono } from 'hono';
import {
  agentQueryGraphSchema,
  agentAnalyzeThemeSchema,
  agentAnalyzeInstrumentSchema,
  agentTraceEventSchema,
  agentBriefSchema,
} from '@ai-vantage/contracts';
import type { ResearchService } from '../services/research-service.js';

export function createAgentToolsRoutes(research: ResearchService) {
  const app = new Hono();

  app.post('/query-graph', async (c) => {
    const body = await c.req.json();
    const parsed = agentQueryGraphSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const explore = await research.queryGraph(parsed.data.query, parsed.data.llm);
    return c.json({ explore, graph: explore.graph });
  });

  app.post('/analyze-theme', async (c) => {
    const body = await c.req.json();
    const parsed = agentAnalyzeThemeSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const view = await research.getThemeView(parsed.data.slug);
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json({ view });
  });

  app.post('/analyze-instrument', async (c) => {
    const body = await c.req.json();
    const parsed = agentAnalyzeInstrumentSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const view = await research.getInstrumentView(parsed.data.symbol);
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json({ view });
  });

  app.post('/trace-event-impact', async (c) => {
    const body = await c.req.json();
    const parsed = agentTraceEventSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const view = await research.getEventView(parsed.data.eventId);
    if (!view) return c.json({ error: 'not_found' }, 404);
    return c.json({ view });
  });

  app.post('/generate-brief', async (c) => {
    const body = await c.req.json();
    const parsed = agentBriefSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const markdown = await research.generateBrief(parsed.data.scope, parsed.data.id);
    return c.json({
      markdown,
      scope: parsed.data.scope,
      id: parsed.data.id,
    });
  });

  return app;
}
