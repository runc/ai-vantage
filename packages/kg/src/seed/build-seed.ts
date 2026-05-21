import type { Entity } from '../entity';
import type { Relation } from '../relation';
import type { OntologyType } from '../ontology';
import { EntityType, RelationPredicate, RecordStatus, OntologyKind } from '../enums';
import { legacyGraphToStandard } from '../adapters/legacy-graph';
import { validateGraph } from '../graph-rules';
import {
  loadRelationsJson,
  loadContentEnrichment,
  resolveContentDir,
} from './load-content';

export interface SeedBundle {
  entities: Entity[];
  relations: Relation[];
  ontologyTypes: OntologyType[];
}

function enrichEntities(
  entities: Entity[],
  contentDir: string,
): Entity[] {
  const { layers, targets, concepts } = loadContentEnrichment(contentDir);
  const layerMap = new Map(layers.map((l) => [l.frontmatter.id, l.frontmatter]));
  const targetMap = new Map(targets.map((t) => [t.frontmatter.id, t.frontmatter]));
  const conceptMap = new Map(concepts.map((c) => [c.frontmatter.id, c.frontmatter]));

  return entities.map((entity) => {
    const props = { ...entity.properties };

    if (entity.type === EntityType.SupplyChainStage) {
      const layer = layerMap.get(entity.id);
      if (layer) {
        props.rank = layer.rank;
        props.certainty = layer.certainty;
        props.summary = layer.summary;
        props.representatives = layer.representatives;
        props.relatedConcepts = layer.relatedConcepts;
      }
    } else if (entity.type === EntityType.Company) {
      const target = targetMap.get(entity.id);
      if (target) {
        props.layer = target.layer;
        props.moat = target.moat;
        props.risk = target.risk;
        props.marketPosition = target.marketPosition;
        if (target.titleZh) props.titleZh = target.titleZh;
      }
    } else if (entity.type === EntityType.Theme) {
      const concept = conceptMap.get(entity.id);
      if (concept) {
        props.relatedLayers = concept.relatedLayers;
        props.relatedTargets = concept.relatedTargets;
      }
    }

    return { ...entity, properties: props };
  });
}

function buildOntologySeed(): OntologyType[] {
  const entityTypes = Object.values(EntityType).map((code, i) => ({
    id: `onto-entity-${code}`,
    kind: OntologyKind.entity_type as OntologyType['kind'],
    name: code,
    code,
    description: `Entity type: ${code}`,
    schema: {},
    constraints: {},
    status: RecordStatus.active as OntologyType['status'],
  }));

  const relationTypes = Object.values(RelationPredicate).map((code) => ({
    id: `onto-relation-${code}`,
    kind: OntologyKind.relation_type as OntologyType['kind'],
    name: code,
    code,
    description: `Relation predicate: ${code}`,
    schema: {},
    constraints: code === 'hurt_by' ? { legacyAlias: 'threatens' } : {},
    status: RecordStatus.active as OntologyType['status'],
  }));

  return [...entityTypes, ...relationTypes];
}

export function buildSeedFromContent(contentDir?: string): SeedBundle {
  const dir = contentDir ?? resolveContentDir();
  const legacy = loadRelationsJson(dir);
  const { entities: baseEntities, relations } = legacyGraphToStandard(legacy);
  const entities = enrichEntities(baseEntities, dir);

  const issues = validateGraph(entities, relations);
  if (issues.length > 0) {
    throw new Error(
      `Seed validation failed:\n${issues.map((i) => `  ${i.path}: ${i.message}`).join('\n')}`,
    );
  }

  return {
    entities,
    relations,
    ontologyTypes: buildOntologySeed(),
  };
}
