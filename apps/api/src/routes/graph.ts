import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  graphQueryResponseSchema,
  graphPathQuerySchema,
  graphPathResponseSchema,
  graphSearchQuerySchema,
  graphSubgraphQuerySchema,
  graphNeighborsResponseSchema,
  exploreQuerySchema,
  exploreResponseSchema,
} from '@ai-vantage/contracts';
import type { GraphService } from '../services/graph-service.js';

export function createGraphRoutes(graphService: GraphService) {
  const app = new OpenAPIHono();

  const graphRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Graph'],
    summary: 'Get full knowledge graph',
    responses: {
      200: {
        description: 'Full graph',
        content: {
          'application/json': { schema: graphQueryResponseSchema },
        },
      },
    },
  });

  app.openapi(graphRoute, async (c) => {
    const data = await graphService.getFullGraph();
    return c.json(data);
  });

  const subgraphRoute = createRoute({
    method: 'get',
    path: '/subgraph',
    tags: ['Graph'],
    summary: 'Get subgraph around an entity',
    request: { query: graphSubgraphQuerySchema },
    responses: {
      200: {
        description: 'Subgraph',
        content: {
          'application/json': { schema: graphQueryResponseSchema },
        },
      },
    },
  });

  app.openapi(subgraphRoute, async (c) => {
    const { entityId, hops } = c.req.valid('query');
    const data = await graphService.getSubgraph(entityId, hops);
    return c.json(data);
  });

  const searchRoute = createRoute({
    method: 'get',
    path: '/search',
    tags: ['Graph'],
    summary: 'Search entities',
    request: { query: graphSearchQuerySchema },
    responses: {
      200: {
        description: 'Search results',
        content: {
          'application/json': { schema: graphQueryResponseSchema },
        },
      },
    },
  });

  app.openapi(searchRoute, async (c) => {
    const { q, limit } = c.req.valid('query');
    const data = await graphService.search(q, limit);
    return c.json(data);
  });

  const pathRoute = createRoute({
    method: 'get',
    path: '/path',
    tags: ['Graph'],
    summary: 'Find paths between two entities',
    request: { query: graphPathQuerySchema },
    responses: {
      200: {
        description: 'Paths',
        content: {
          'application/json': { schema: graphPathResponseSchema },
        },
      },
    },
  });

  app.openapi(pathRoute, async (c) => {
    const { startId, endId, maxDepth } = c.req.valid('query');
    const paths = await graphService.findPaths(startId, endId, maxDepth);
    return c.json({ paths });
  });

  const neighborsRoute = createRoute({
    method: 'get',
    path: '/neighbors/{entityId}',
    tags: ['Graph'],
    summary: 'Get N-hop neighbors',
    request: {
      params: z.object({ entityId: z.string() }),
      query: z.object({
        hops: z.coerce.number().int().min(1).max(3).default(1).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Neighbors',
        content: {
          'application/json': { schema: graphNeighborsResponseSchema },
        },
      },
    },
  });

  app.openapi(neighborsRoute, async (c) => {
    const { entityId } = c.req.valid('param');
    const hops = c.req.query('hops')
      ? Number(c.req.query('hops'))
      : 1;
    const data = await graphService.getNeighbors(entityId, hops);
    return c.json(data);
  });

  const exploreRoute = createRoute({
    method: 'get',
    path: '/explore',
    tags: ['Graph'],
    summary: 'Natural-language graph exploration',
    request: { query: exploreQuerySchema },
    responses: {
      200: {
        description: 'Parsed query + subgraph',
        content: {
          'application/json': { schema: exploreResponseSchema },
        },
      },
    },
  });

  app.openapi(exploreRoute, async (c) => {
    const { q, llm } = c.req.valid('query');
    const data = await graphService.explore(q, { useLlm: llm ?? false });
    return c.json(data);
  });

  return app;
}
