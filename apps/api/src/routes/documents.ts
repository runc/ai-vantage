import { Hono } from 'hono';
import {
  createDocumentSchema,
  fromMdxDocumentSchema,
} from '@ai-vantage/contracts';
import type { DocumentService } from '../services/document-service.js';
import type { IngestService } from '../services/ingest-service.js';
import { getActor } from '../lib/actor.js';

export function createDocumentRoutes(
  documentService: DocumentService,
  ingestService: IngestService,
) {
  const app = new Hono();

  app.get('/', async (c) => {
    const documents = await documentService.list();
    return c.json({ documents });
  });

  app.get('/:id', async (c) => {
    const doc = await documentService.getById(c.req.param('id'));
    if (!doc) return c.json({ error: 'not_found' }, 404);
    return c.json(doc);
  });

  app.get('/:id/extractions', async (c) => {
    const extractions = await ingestService.listExtractions(c.req.param('id'));
    return c.json({ extractions });
  });

  app.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = createDocumentSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const doc = await documentService.create(parsed.data, getActor(c));
    return c.json(doc, 201);
  });

  app.post('/from-mdx', async (c) => {
    const body = await c.req.json();
    const parsed = fromMdxDocumentSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
    const doc = await documentService.registerFromMdx(
      parsed.data.kind,
      parsed.data.slug,
      getActor(c),
    );
    if (!doc) return c.json({ error: 'mdx_not_found' }, 404);
    return c.json(doc, 201);
  });

  app.post('/:id/ingest', async (c) => {
    try {
      const result = await ingestService.ingest(c.req.param('id'), getActor(c));
      if ('error' in result && typeof result.error === 'string') {
        const status =
          result.error === 'document_not_found'
            ? 404
            : result.error === 'missing_primary_entity' ||
                result.error === 'document_has_no_text'
              ? 400
              : 500;
        return c.json({ error: result.error }, status);
      }
      return c.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ error: 'ingest_failed', message }, 500);
    }
  });

  return app;
}
