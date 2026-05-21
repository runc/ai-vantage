import {
  EntityRepository,
  RelationRepository,
  AssertionRepository,
  GraphRepository,
} from '@ai-vantage/db';
import {
  EntityType,
  buildResearchIndex,
  buildDomainView,
  buildThemeView,
  buildInstrumentView,
  buildEventView,
} from '@ai-vantage/kg';
import type {
  ResearchIndexResponse,
  DomainViewResponse,
  ThemeViewResponse,
  InstrumentViewResponse,
  EventViewResponse,
} from '@ai-vantage/contracts';
import { entityToDto, assertionToDto } from '../lib/dto-mappers.js';
import type { GraphService } from './graph-service.js';

export class ResearchService {
  constructor(
    private entityRepo: EntityRepository,
    private relationRepo: RelationRepository,
    private assertionRepo: AssertionRepository,
    private graphRepo: GraphRepository,
    private graphService: GraphService,
  ) {}

  private async loadGraphContext() {
    const entities = await this.entityRepo.findAllActive();
    const relations = await this.relationRepo.findAllActive();
    const assertions = await this.assertionRepo.findMany({ limit: 200 });
    return { entities, relations, assertions };
  }

  async getIndex(): Promise<ResearchIndexResponse> {
    const { entities } = await this.loadGraphContext();
    return buildResearchIndex(entities);
  }

  async getDomainView(slug: string): Promise<DomainViewResponse | null> {
    const { entities, relations, assertions } = await this.loadGraphContext();
    let domain = await this.entityRepo.resolveIdOrSlug(slug);
    if (!domain && slug === 'ai-industry') {
      domain = await this.entityRepo.findById('domain-ai-industry');
    }
    if (!domain || domain.type !== EntityType.Domain) {
      if (slug === 'ai-industry') {
        domain = {
          id: 'domain-ai-industry',
          type: EntityType.Domain,
          name: 'AI 产业链',
          slug: 'ai-industry',
          aliases: [],
          properties: {
            summary: '七层 AI 产业投资架构（未入库领域实体时的合成视图）',
          },
          status: 'active',
          source: 'synthetic',
        };
      } else {
        return null;
      }
    }

    const view = buildDomainView(domain, entities, relations, assertions);
    const nameMap = new Map(entities.map((e) => [e.id, e.name]));

    return {
      entity: entityToDto(view.entity),
      summary: view.summary,
      themes: view.themes,
      layers: view.layers,
      companies: view.companies,
      events: view.events,
      assertions: view.assertions.map((a) =>
        assertionToDto(a, {
          subjectName: nameMap.get(a.subjectEntityId),
          objectName: a.objectEntityId ? nameMap.get(a.objectEntityId) : undefined,
        }),
      ),
      risks: view.risks,
    };
  }

  async getThemeView(slug: string): Promise<ThemeViewResponse | null> {
    const theme = await this.entityRepo.resolveIdOrSlug(slug);
    if (!theme || theme.type !== EntityType.Theme) return null;

    const { entities, relations, assertions } = await this.loadGraphContext();
    const view = buildThemeView(theme, entities, relations, assertions);
    const nameMap = new Map(entities.map((e) => [e.id, e.name]));

    return {
      entity: entityToDto(view.entity),
      thesis: view.thesis,
      beneficiaries: view.beneficiaries,
      hurt: view.hurt,
      relatedInstruments: view.relatedInstruments,
      supportingAssertions: view.supportingAssertions.map((a) =>
        assertionToDto(a, {
          subjectName: nameMap.get(a.subjectEntityId),
          objectName: a.objectEntityId ? nameMap.get(a.objectEntityId) : undefined,
        }),
      ),
      contradictingAssertions: view.contradictingAssertions.map((a) =>
        assertionToDto(a, {
          subjectName: nameMap.get(a.subjectEntityId),
          objectName: a.objectEntityId ? nameMap.get(a.objectEntityId) : undefined,
        }),
      ),
    };
  }

  async getInstrumentView(symbol: string): Promise<InstrumentViewResponse | null> {
    const company = await this.entityRepo.resolveIdOrSlug(symbol);
    if (!company || company.type !== EntityType.Company) return null;

    const { entities, relations, assertions } = await this.loadGraphContext();
    const view = buildInstrumentView(company, entities, relations, assertions);
    const nameMap = new Map(entities.map((e) => [e.id, e.name]));

    return {
      entity: entityToDto(view.entity),
      layer: view.layer ?? null,
      upstream: view.upstream,
      downstream: view.downstream,
      competitors: view.competitors,
      assertions: view.assertions.map((a) =>
        assertionToDto(a, {
          subjectName: nameMap.get(a.subjectEntityId),
          objectName: a.objectEntityId ? nameMap.get(a.objectEntityId) : undefined,
        }),
      ),
      events: view.events,
    };
  }

  async getEventView(id: string): Promise<EventViewResponse | null> {
    const event = await this.entityRepo.resolveIdOrSlug(id);
    if (!event || event.type !== EntityType.Event) return null;

    const { entities, relations, assertions } = await this.loadGraphContext();
    const paths: string[][] = [];
    for (const companyId of ['nvidia', 'tsmc', 'amd', 'asml']) {
      if (companyId === event.id) continue;
      const found = await this.graphRepo.findPaths(event.id, companyId, 4);
      if (found.length > 0) paths.push(...found.slice(0, 2));
    }

    const view = buildEventView(event, entities, relations, assertions, paths.slice(0, 6));
    const nameMap = new Map(entities.map((e) => [e.id, e.name]));

    return {
      entity: entityToDto(view.entity),
      summary: view.summary,
      affectedDomains: view.affectedDomains,
      affectedThemes: view.affectedThemes,
      affectedCompanies: view.affectedCompanies,
      impactPaths: view.impactPaths,
      assertions: view.assertions.map((a) =>
        assertionToDto(a, {
          subjectName: nameMap.get(a.subjectEntityId),
          objectName: a.objectEntityId ? nameMap.get(a.objectEntityId) : undefined,
        }),
      ),
    };
  }

  async generateBrief(scope: 'domain' | 'theme' | 'instrument' | 'event', id: string): Promise<string> {
    if (scope === 'domain') {
      const v = await this.getDomainView(id);
      if (!v) return '未找到领域视图。';
      return [
        `# ${v.entity.name}`,
        '',
        v.summary ?? '',
        '',
        `## 层级（${v.layers.length}）`,
        ...v.layers.map((l) => `- ${l.name}`),
        '',
        `## 核心标的（${v.companies.length}）`,
        ...v.companies.slice(0, 8).map((c) => `- ${c.name}`),
        '',
        `## 关键判断（${v.assertions.length}）`,
        ...v.assertions.slice(0, 5).map((a) => `- ${a.claimText}`),
      ].join('\n');
    }
    if (scope === 'theme') {
      const v = await this.getThemeView(id);
      if (!v) return '未找到主题视图。';
      return [
        `# ${v.entity.name}`,
        '',
        v.thesis ?? '',
        '',
        `## 相关标的`,
        ...v.relatedInstruments.map((i) => `- ${i.name}`),
        '',
        `## 支撑判断`,
        ...v.supportingAssertions.slice(0, 5).map((a) => `- ${a.claimText}`),
      ].join('\n');
    }
    if (scope === 'instrument') {
      const v = await this.getInstrumentView(id);
      if (!v) return '未找到标的视图。';
      return [
        `# ${v.entity.name}`,
        '',
        v.layer ? `所属层级：${v.layer.name}` : '',
        '',
        `## 竞争`,
        ...v.competitors.map((c) => `- ${c.name}`),
        '',
        `## 投资判断`,
        ...v.assertions.slice(0, 5).map((a) => `- ${a.claimText}`),
      ].join('\n');
    }
    const v = await this.getEventView(id);
    if (!v) return '未找到事件视图。';
    return [
      `# ${v.entity.name}`,
      '',
      v.summary ?? '',
      '',
      `## 影响公司`,
      ...v.affectedCompanies.map((c) => `- ${c.name}`),
      '',
      `## 影响路径`,
      ...v.impactPaths.slice(0, 3).map((p) => `- ${p.labels.join(' → ')}`),
    ].join('\n');
  }

  queryGraph(query: string, useLlm?: boolean) {
    return this.graphService.explore(query, { useLlm });
  }
}
