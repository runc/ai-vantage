import { describe, it, expect } from 'vitest';
import {
  mapLegacyEdgeType,
  mapLegacyNodeType,
  validateGraph,
  LEGACY_EDGE_TYPE_MAP,
} from './graph-rules';
import type { Entity } from './entity';
import type { Relation } from './relation';
import { EntityType, RelationPredicate, RecordStatus } from './enums';

describe('graph-rules', () => {
  it('maps all legacy edge types', () => {
    for (const key of Object.keys(LEGACY_EDGE_TYPE_MAP)) {
      expect(mapLegacyEdgeType(key)).toBeTruthy();
    }
    expect(mapLegacyEdgeType('belongs-to')).toBe(RelationPredicate.belongs_to);
    expect(mapLegacyEdgeType('threatens')).toBe(RelationPredicate.hurt_by);
  });

  it('maps legacy node types', () => {
    expect(mapLegacyNodeType('layer')).toBe(EntityType.SupplyChainStage);
    expect(mapLegacyNodeType('target')).toBe(EntityType.Company);
    expect(mapLegacyNodeType('concept')).toBe(EntityType.Theme);
  });

  it('rejects unknown entity references in relations', () => {
    const entities: Entity[] = [
      {
        id: 'a',
        type: EntityType.Company,
        name: 'A',
        slug: 'a',
        aliases: [],
        properties: {},
        status: RecordStatus.active,
      },
    ];
    const relations: Relation[] = [
      {
        id: 'r1',
        subjectEntityId: 'a',
        predicate: RelationPredicate.supplies_to,
        objectEntityId: 'missing',
        properties: {},
        confidence: 1,
        status: RecordStatus.active,
      },
    ];
    const issues = validateGraph(entities, relations);
    expect(issues.some((i) => i.message.includes('Unknown object entity'))).toBe(true);
  });
});
