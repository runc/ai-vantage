import type {
  ResearchIndexResponse,
  DomainViewResponse,
  ThemeViewResponse,
  InstrumentViewResponse,
} from '@ai-vantage/contracts';
import legacyGraph from '../../content/graph/relations.json';

type LegacyNode = { id: string; type: string; label: string };

const nodes = legacyGraph.nodes as LegacyNode[];

const layers = nodes.filter((n) => n.type === 'layer');
const targets = nodes.filter((n) => n.type === 'target');
const concepts = nodes.filter((n) => n.type === 'concept');

/** Static fallback when API is unavailable (no Node fs). */
export function buildStaticResearchIndex(): ResearchIndexResponse {
  return {
    domains: [
      {
        id: 'domain-ai-industry',
        name: 'AI 产业链',
        slug: 'ai-industry',
        type: 'Domain',
      },
    ],
    themes: concepts.map((c) => ({
      id: c.id,
      name: c.label,
      slug: c.id,
      type: 'Theme',
    })),
    instruments: targets.map((t) => ({
      id: t.id,
      name: t.label,
      slug: t.id,
      type: 'Company',
    })),
    events: [],
  };
}

export function buildStaticDomainView(slug: string): DomainViewResponse | null {
  if (slug !== 'ai-industry') return null;
  return {
    entity: {
      id: 'domain-ai-industry',
      type: 'Domain',
      name: 'AI 产业链',
      slug: 'ai-industry',
      status: 'active',
      description: '七层 AI 产业投资架构（静态模式）',
      properties: {},
    },
    summary: '从物理工程到应用模型的分层投资框架。',
    layers: layers.map((l) => ({
      id: l.id,
      name: l.label,
      slug: l.id,
      type: 'SupplyChainStage',
    })),
    companies: targets.map((t) => ({
      id: t.id,
      name: t.label,
      slug: t.id,
      type: 'Company',
    })),
    themes: concepts.map((c) => ({
      id: c.id,
      name: c.label,
      slug: c.id,
      type: 'Theme',
    })),
    events: [],
    assertions: [],
    risks: ['出口管制', 'CapEx 周期', '开源替代'],
  };
}

export function buildStaticThemeView(slug: string): ThemeViewResponse | null {
  const concept = concepts.find((c) => c.id === slug);
  if (!concept) return null;
  return {
    entity: {
      id: concept.id,
      type: 'Theme',
      name: concept.label,
      slug,
      status: 'active',
      properties: {},
    },
    beneficiaries: [],
    hurt: [],
    relatedInstruments: [],
    supportingAssertions: [],
    contradictingAssertions: [],
  };
}

export function buildStaticInstrumentView(symbol: string): InstrumentViewResponse | null {
  const target = targets.find((t) => t.id === symbol);
  if (!target) return null;
  const layer = layers.find((l) => {
    const edge = legacyGraph.edges.find(
      (e) => e.source === target.id && e.target === l.id && e.type === 'belongs-to',
    );
    return !!edge;
  });
  return {
    entity: {
      id: target.id,
      type: 'Company',
      name: target.label,
      slug: target.id,
      status: 'active',
      properties: {},
    },
    layer: layer
      ? { id: layer.id, name: layer.label, slug: layer.id, type: 'SupplyChainStage' }
      : null,
    upstream: [],
    downstream: [],
    competitors: legacyGraph.edges
      .filter((e) => e.type === 'competes-with' && (e.source === target.id || e.target === target.id))
      .map((e) => (e.source === target.id ? e.target : e.source))
      .map((id) => targets.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => ({ id: t!.id, name: t!.label, slug: t!.id, type: 'Company' })),
    assertions: [],
    events: [],
  };
}
