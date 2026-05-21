import type { Entity } from '../entity';
import type { Relation } from '../relation';
import type { Assertion } from '../assertion';
import { EntityType, RelationPredicate } from '../enums';

export interface ResearchEntityRef {
  id: string;
  name: string;
  slug: string;
  type: string;
}

function toRef(e: Entity): ResearchEntityRef {
  return { id: e.id, name: e.name, slug: e.slug, type: e.type };
}

function entityMap(entities: Entity[]): Map<string, Entity> {
  return new Map(entities.map((e) => [e.id, e]));
}

function relationsTouching(
  relations: Relation[],
  entityId: string,
  predicate?: string,
  direction: 'out' | 'in' | 'both' = 'both',
): Relation[] {
  return relations.filter((r) => {
    if (predicate && r.predicate !== predicate) return false;
    if (direction === 'out') return r.subjectEntityId === entityId;
    if (direction === 'in') return r.objectEntityId === entityId;
    return r.subjectEntityId === entityId || r.objectEntityId === entityId;
  });
}

function neighborIds(
  relations: Relation[],
  entityId: string,
  predicate?: string,
  direction: 'out' | 'in' | 'both' = 'both',
): string[] {
  const ids = new Set<string>();
  for (const r of relationsTouching(relations, entityId, predicate, direction)) {
    if (r.subjectEntityId === entityId) ids.add(r.objectEntityId);
    if (r.objectEntityId === entityId) ids.add(r.subjectEntityId);
  }
  ids.delete(entityId);
  return [...ids];
}

export function assertionsForEntity(
  assertions: Assertion[],
  entityId: string,
  statuses?: string[],
): Assertion[] {
  const allowed = statuses ? new Set(statuses) : null;
  return assertions.filter((a) => {
    if (a.subjectEntityId !== entityId && a.objectEntityId !== entityId) return false;
    if (allowed && !allowed.has(a.status)) return false;
    return true;
  });
}

export function buildResearchIndex(entities: Entity[]): {
  domains: ResearchEntityRef[];
  themes: ResearchEntityRef[];
  instruments: ResearchEntityRef[];
  events: ResearchEntityRef[];
} {
  const domains = entities.filter((e) => e.type === EntityType.Domain).map(toRef);
  const themes = entities.filter((e) => e.type === EntityType.Theme).map(toRef);
  const instruments = entities
    .filter((e) => e.type === EntityType.Company || e.type === EntityType.Instrument)
    .map(toRef);
  const events = entities.filter((e) => e.type === EntityType.Event).map(toRef);

  if (domains.length === 0) {
    domains.push({
      id: 'domain-ai-industry',
      name: 'AI 产业链',
      slug: 'ai-industry',
      type: EntityType.Domain,
    });
  }

  return { domains, themes, instruments, events };
}

export function buildDomainView(
  domain: Entity,
  entities: Entity[],
  relations: Relation[],
  assertions: Assertion[],
): {
  entity: Entity;
  summary?: string;
  themes: ResearchEntityRef[];
  layers: ResearchEntityRef[];
  companies: ResearchEntityRef[];
  events: ResearchEntityRef[];
  assertions: Assertion[];
  risks?: string[];
} {
  const map = entityMap(entities);
  const contained = neighborIds(relations, domain.id, RelationPredicate.contains, 'out');
  const related = neighborIds(relations, domain.id, RelationPredicate.relates_to);

  const layers = contained
    .map((id) => map.get(id))
    .filter((e): e is Entity => !!e && e.type === EntityType.SupplyChainStage)
    .sort((a, b) => {
      const ra = (a.properties?.rank as number) ?? 0;
      const rb = (b.properties?.rank as number) ?? 0;
      return ra - rb;
    });

  const themes = [...contained, ...related]
    .map((id) => map.get(id))
    .filter((e): e is Entity => !!e && e.type === EntityType.Theme);

  const eventIds = neighborIds(relations, domain.id, RelationPredicate.affected_by, 'in');
  const events = eventIds
    .map((id) => map.get(id))
    .filter((e): e is Entity => e?.type === EntityType.Event);

  const layerIds = new Set(layers.map((l) => l.id));
  const companies = entities
    .filter((e) => e.type === EntityType.Company)
    .filter((c) => {
      const layerId = c.properties?.layer as string | undefined;
      return !layerIds.size || (layerId && layerIds.has(layerId));
    });

  if (layers.length === 0) {
    const allLayers = entities
      .filter((e) => e.type === EntityType.SupplyChainStage)
      .sort((a, b) => {
        const ra = (a.properties?.rank as number) ?? 0;
        const rb = (b.properties?.rank as number) ?? 0;
        return ra - rb;
      });
    layers.push(...allLayers);
  }

  if (themes.length === 0) {
    themes.push(...entities.filter((e) => e.type === EntityType.Theme));
  }

  if (companies.length === 0) {
    companies.push(...entities.filter((e) => e.type === EntityType.Company));
  }

  const domainAssertions = assertionsForEntity(assertions, domain.id, [
    'active',
    'verified',
    'candidate',
  ]);

  return {
    entity: domain,
    summary:
      (domain.description as string | undefined) ??
      (domain.properties?.summary as string | undefined),
    themes: [...new Map(themes.map((t) => [t.id, t])).values()].map(toRef),
    layers: layers.map(toRef),
    companies: companies.map(toRef),
    events: events.map(toRef),
    assertions: domainAssertions,
    risks: (domain.properties?.risks as string[] | undefined) ?? [],
  };
}

export function buildThemeView(
  theme: Entity,
  entities: Entity[],
  relations: Relation[],
  assertions: Assertion[],
): {
  entity: Entity;
  thesis?: string;
  beneficiaries: ResearchEntityRef[];
  hurt: ResearchEntityRef[];
  relatedInstruments: ResearchEntityRef[];
  supportingAssertions: Assertion[];
  contradictingAssertions: Assertion[];
} {
  const map = entityMap(entities);
  const benefitIds = neighborIds(relations, theme.id, RelationPredicate.benefits_from, 'in');
  const hurtIds = neighborIds(relations, theme.id, RelationPredicate.hurt_by, 'in');

  const propTargets = (theme.properties?.relatedTargets as string[] | undefined) ?? [];
  const relatedInstruments = propTargets
    .map((id) => map.get(id))
    .filter((e): e is Entity => !!e && e.type === EntityType.Company)
    .map(toRef);

  const beneficiaries = benefitIds
    .map((id) => map.get(id))
    .filter((e): e is Entity => !!e)
    .map(toRef);

  const hurt = hurtIds
    .map((id) => map.get(id))
    .filter((e): e is Entity => !!e)
    .map(toRef);

  const related = [...relatedInstruments];
  for (const id of propTargets) {
    const e = map.get(id);
    if (e && !related.find((r) => r.id === e.id)) related.push(toRef(e));
  }

  const all = assertionsForEntity(assertions, theme.id);
  const supportingAssertions = all.filter(
    (a) =>
      a.predicate === RelationPredicate.supports ||
      a.status === 'active' ||
      a.status === 'verified',
  );
  const contradictingAssertions = all.filter(
    (a) => a.predicate === RelationPredicate.contradicts || a.status === 'candidate',
  );

  return {
    entity: theme,
    thesis:
      (theme.description as string | undefined) ??
      (theme.properties?.thesis as string | undefined),
    beneficiaries,
    hurt,
    relatedInstruments: related,
    supportingAssertions,
    contradictingAssertions,
  };
}

export function buildInstrumentView(
  company: Entity,
  entities: Entity[],
  relations: Relation[],
  assertions: Assertion[],
): {
  entity: Entity;
  layer?: ResearchEntityRef | null;
  upstream: ResearchEntityRef[];
  downstream: ResearchEntityRef[];
  competitors: ResearchEntityRef[];
  assertions: Assertion[];
  events: ResearchEntityRef[];
} {
  const map = entityMap(entities);
  const layerId = company.properties?.layer as string | undefined;
  const layer = layerId && map.get(layerId) ? toRef(map.get(layerId)!) : null;

  const upstreamIds = neighborIds(relations, company.id, RelationPredicate.supplies_to, 'in');
  const downstreamIds = neighborIds(relations, company.id, RelationPredicate.supplies_to, 'out');
  const competitorIds = neighborIds(relations, company.id, RelationPredicate.competes_with);
  const eventIds = neighborIds(relations, company.id, RelationPredicate.affected_by, 'in');

  return {
    entity: company,
    layer,
    upstream: upstreamIds.map((id) => map.get(id)).filter(Boolean).map((e) => toRef(e!)),
    downstream: downstreamIds.map((id) => map.get(id)).filter(Boolean).map((e) => toRef(e!)),
    competitors: competitorIds.map((id) => map.get(id)).filter(Boolean).map((e) => toRef(e!)),
    assertions: assertionsForEntity(assertions, company.id, ['active', 'verified', 'candidate']),
    events: eventIds
      .map((id) => map.get(id))
      .filter((e): e is Entity => e?.type === EntityType.Event)
      .map(toRef),
  };
}

export function buildEventView(
  event: Entity,
  entities: Entity[],
  relations: Relation[],
  assertions: Assertion[],
  pathsFromEvent?: string[][],
): {
  entity: Entity;
  summary?: string;
  affectedDomains: ResearchEntityRef[];
  affectedThemes: ResearchEntityRef[];
  affectedCompanies: ResearchEntityRef[];
  impactPaths: { path: string[]; labels: string[] }[];
  assertions: Assertion[];
} {
  const map = entityMap(entities);
  const affectedIds = neighborIds(relations, event.id, RelationPredicate.affected_by, 'out');

  const affectedDomains: ResearchEntityRef[] = [];
  const affectedThemes: ResearchEntityRef[] = [];
  const affectedCompanies: ResearchEntityRef[] = [];

  for (const id of affectedIds) {
    const e = map.get(id);
    if (!e) continue;
    const ref = toRef(e);
    if (e.type === EntityType.Domain) affectedDomains.push(ref);
    else if (e.type === EntityType.Theme) affectedThemes.push(ref);
    else if (e.type === EntityType.Company) affectedCompanies.push(ref);
  }

  const impactPaths = (pathsFromEvent ?? []).map((path) => ({
    path,
    labels: path.map((id) => map.get(id)?.name ?? id),
  }));

  return {
    entity: event,
    summary:
      (event.description as string | undefined) ??
      (event.properties?.summary as string | undefined),
    affectedDomains,
    affectedThemes,
    affectedCompanies,
    impactPaths,
    assertions: assertionsForEntity(assertions, event.id),
  };
}
