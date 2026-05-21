import type { Entity } from './entity';
import type { Relation } from './relation';
import { EntityType, RelationPredicate, RecordStatus } from './enums';

export const ACTIVE_STATUSES = new Set([
  RecordStatus.verified,
  RecordStatus.active,
]);

/** Legacy kebab-case edge types from relations.json */
export const LEGACY_EDGE_TYPE_MAP: Record<string, keyof typeof RelationPredicate> = {
  'belongs-to': 'belongs_to',
  'supplies-to': 'supplies_to',
  'competes-with': 'competes_with',
  threatens: 'hurt_by',
  'relates-to': 'relates_to',
};

/** Legacy node types from relations.json */
export const LEGACY_NODE_TYPE_MAP: Record<string, keyof typeof EntityType> = {
  layer: 'SupplyChainStage',
  target: 'Company',
  concept: 'Theme',
};

export function mapLegacyEdgeType(legacyType: string): string {
  const mapped = LEGACY_EDGE_TYPE_MAP[legacyType];
  if (!mapped) {
    throw new Error(`Unknown legacy edge type: ${legacyType}`);
  }
  return RelationPredicate[mapped];
}

export function mapLegacyNodeType(legacyType: string): string {
  const mapped = LEGACY_NODE_TYPE_MAP[legacyType];
  if (!mapped) {
    throw new Error(`Unknown legacy node type: ${legacyType}`);
  }
  return EntityType[mapped];
}

export function isActiveStatus(status: string): boolean {
  return (
    status === RecordStatus.active || status === RecordStatus.verified
  );
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validateEntity(entity: Entity): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!entity.id.trim()) issues.push({ path: 'id', message: 'Entity id is required' });
  if (!entity.slug.trim()) issues.push({ path: 'slug', message: 'Entity slug is required' });
  if (!entity.name.trim()) issues.push({ path: 'name', message: 'Entity name is required' });
  return issues;
}

export function validateRelation(
  relation: Relation,
  entityIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!relation.id.trim()) issues.push({ path: 'id', message: 'Relation id is required' });
  if (!entityIds.has(relation.subjectEntityId)) {
    issues.push({
      path: 'subjectEntityId',
      message: `Unknown subject entity: ${relation.subjectEntityId}`,
    });
  }
  if (!entityIds.has(relation.objectEntityId)) {
    issues.push({
      path: 'objectEntityId',
      message: `Unknown object entity: ${relation.objectEntityId}`,
    });
  }
  if (relation.subjectEntityId === relation.objectEntityId) {
    issues.push({ path: 'objectEntityId', message: 'Self-loop relations are not allowed' });
  }
  if (relation.confidence < 0 || relation.confidence > 1) {
    issues.push({ path: 'confidence', message: 'Confidence must be between 0 and 1' });
  }
  return issues;
}

export function validateGraph(
  entities: Entity[],
  relations: Relation[],
): ValidationIssue[] {
  const entityIds = new Set(entities.map((e) => e.id));
  const issues: ValidationIssue[] = [];

  for (const entity of entities) {
    issues.push(...validateEntity(entity).map((i) => ({
      ...i,
      path: `entities.${entity.id}.${i.path}`,
    })));
  }

  const relationIds = new Set<string>();
  for (const relation of relations) {
    if (relationIds.has(relation.id)) {
      issues.push({
        path: `relations.${relation.id}`,
        message: `Duplicate relation id: ${relation.id}`,
      });
    }
    relationIds.add(relation.id);
    issues.push(...validateRelation(relation, entityIds).map((i) => ({
      ...i,
      path: `relations.${relation.id}.${i.path}`,
    })));
  }

  return issues;
}

export function filterActiveGraph(
  entities: Entity[],
  relations: Relation[],
): { entities: Entity[]; relations: Relation[] } {
  const activeEntityIds = new Set(
    entities.filter((e) => isActiveStatus(e.status)).map((e) => e.id),
  );
  return {
    entities: entities.filter((e) => activeEntityIds.has(e.id)),
    relations: relations.filter(
      (r) =>
        isActiveStatus(r.status) &&
        activeEntityIds.has(r.subjectEntityId) &&
        activeEntityIds.has(r.objectEntityId),
    ),
  };
}
