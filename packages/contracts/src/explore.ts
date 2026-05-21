import { z } from 'zod';
import { graphQueryResponseSchema } from './graph.js';

export const exploreQuerySchema = z.object({
  q: z.string().min(1),
  llm: z
    .enum(['true', 'false', '1', '0'])
    .optional()
    .transform((v) => v === 'true' || v === '1'),
});

export const exploreEntityRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  legacyNodeType: z.enum(['layer', 'target', 'concept']).optional(),
});

export const exploreParseSchema = z.object({
  mode: z.enum(['focus_subgraph', 'supply_chain', 'industry_chain', 'path_between']),
  hops: z.number(),
  focus: exploreEntityRefSchema.optional(),
  pathEnd: exploreEntityRefSchema.optional(),
  layerIds: z.array(z.string()).optional(),
  summary: z.string(),
  rawQuery: z.string(),
});

export const exploreResponseSchema = z.object({
  parse: exploreParseSchema,
  parser: z.enum(['rule', 'llm']),
  graph: graphQueryResponseSchema,
  nodeIds: z.array(z.string()),
  paths: z.array(z.array(z.string())).optional(),
});

export type ExploreResponse = z.infer<typeof exploreResponseSchema>;
