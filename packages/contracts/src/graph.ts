import { z } from 'zod';

/** Legacy view node for React Flow (UI layer). */
export const viewNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['layer', 'target', 'concept']),
  label: z.string(),
  data: z.record(z.unknown()).optional(),
});

export const viewEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum([
    'belongs-to',
    'competes-with',
    'supplies-to',
    'threatens',
    'relates-to',
  ]),
  label: z.string(),
});

export const graphViewDataSchema = z.object({
  nodes: z.array(viewNodeSchema),
  edges: z.array(viewEdgeSchema),
});

export type ViewNode = z.infer<typeof viewNodeSchema>;
export type ViewEdge = z.infer<typeof viewEdgeSchema>;
export type GraphViewData = z.infer<typeof graphViewDataSchema>;

/** API entity summary */
export const graphEntityDtoSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  slug: z.string(),
  properties: z.record(z.unknown()).optional(),
  legacyNodeType: z.enum(['layer', 'target', 'concept']).optional(),
});

export const graphRelationDtoSchema = z.object({
  id: z.string(),
  subjectEntityId: z.string(),
  predicate: z.string(),
  objectEntityId: z.string(),
  label: z.string().optional(),
  confidence: z.number(),
  legacyEdgeType: z
    .enum(['belongs-to', 'competes-with', 'supplies-to', 'threatens', 'relates-to'])
    .optional(),
});

export const graphQueryResponseSchema = z.object({
  entities: z.array(graphEntityDtoSchema),
  relations: z.array(graphRelationDtoSchema),
});

export type GraphEntityDto = z.infer<typeof graphEntityDtoSchema>;
export type GraphRelationDto = z.infer<typeof graphRelationDtoSchema>;
export type GraphQueryResponse = z.infer<typeof graphQueryResponseSchema>;

export const graphPathQuerySchema = z.object({
  startId: z.string(),
  endId: z.string(),
  maxDepth: z.coerce.number().int().min(1).max(10).default(5),
});

export const graphSearchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const graphSubgraphQuerySchema = z.object({
  entityId: z.string(),
  hops: z.coerce.number().int().min(1).max(3).default(2),
});

export const graphNeighborsParamsSchema = z.object({
  entityId: z.string(),
  hops: z.coerce.number().int().min(1).max(3).default(1),
});

export const graphPathResponseSchema = z.object({
  paths: z.array(z.array(z.string())),
});

export const graphNeighborsResponseSchema = z.object({
  entityId: z.string(),
  nodeIds: z.array(z.string()),
  relationIds: z.array(z.string()),
});
