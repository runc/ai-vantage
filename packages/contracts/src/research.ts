import { z } from 'zod';
import { entityDtoSchema } from './entities';
import { assertionDtoSchema } from './assertions';
import { graphQueryResponseSchema } from './graph';

export const researchEntityRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.string(),
});

export const researchIndexResponseSchema = z.object({
  domains: z.array(researchEntityRefSchema),
  themes: z.array(researchEntityRefSchema),
  instruments: z.array(researchEntityRefSchema),
  events: z.array(researchEntityRefSchema),
});

export const domainViewResponseSchema = z.object({
  entity: entityDtoSchema,
  summary: z.string().optional(),
  themes: z.array(researchEntityRefSchema),
  layers: z.array(researchEntityRefSchema),
  companies: z.array(researchEntityRefSchema),
  events: z.array(researchEntityRefSchema),
  assertions: z.array(assertionDtoSchema),
  risks: z.array(z.string()).optional(),
});

export const themeViewResponseSchema = z.object({
  entity: entityDtoSchema,
  thesis: z.string().optional(),
  beneficiaries: z.array(researchEntityRefSchema),
  hurt: z.array(researchEntityRefSchema),
  relatedInstruments: z.array(researchEntityRefSchema),
  supportingAssertions: z.array(assertionDtoSchema),
  contradictingAssertions: z.array(assertionDtoSchema),
});

export const instrumentViewResponseSchema = z.object({
  entity: entityDtoSchema,
  layer: researchEntityRefSchema.nullable().optional(),
  upstream: z.array(researchEntityRefSchema),
  downstream: z.array(researchEntityRefSchema),
  competitors: z.array(researchEntityRefSchema),
  assertions: z.array(assertionDtoSchema),
  events: z.array(researchEntityRefSchema),
});

export const eventImpactPathSchema = z.object({
  path: z.array(z.string()),
  labels: z.array(z.string()),
});

export const eventViewResponseSchema = z.object({
  entity: entityDtoSchema,
  summary: z.string().optional(),
  affectedDomains: z.array(researchEntityRefSchema),
  affectedThemes: z.array(researchEntityRefSchema),
  affectedCompanies: z.array(researchEntityRefSchema),
  impactPaths: z.array(eventImpactPathSchema),
  assertions: z.array(assertionDtoSchema),
});

export const agentQueryGraphSchema = z.object({
  query: z.string().min(1),
  llm: z.coerce.boolean().optional(),
});

export const agentAnalyzeThemeSchema = z.object({
  slug: z.string().min(1),
});

export const agentAnalyzeInstrumentSchema = z.object({
  symbol: z.string().min(1),
});

export const agentTraceEventSchema = z.object({
  eventId: z.string().min(1),
});

export const agentBriefSchema = z.object({
  scope: z.enum(['domain', 'theme', 'instrument', 'event']),
  id: z.string().min(1),
});

export const agentQueryGraphResponseSchema = z.object({
  explore: z.unknown(),
  graph: graphQueryResponseSchema.optional(),
});

export const agentBriefResponseSchema = z.object({
  markdown: z.string(),
  scope: z.string(),
  id: z.string(),
});

export type ResearchEntityRef = z.infer<typeof researchEntityRefSchema>;
export type ResearchIndexResponse = z.infer<typeof researchIndexResponseSchema>;
export type DomainViewResponse = z.infer<typeof domainViewResponseSchema>;
export type ThemeViewResponse = z.infer<typeof themeViewResponseSchema>;
export type InstrumentViewResponse = z.infer<typeof instrumentViewResponseSchema>;
export type EventViewResponse = z.infer<typeof eventViewResponseSchema>;
