import type { Entity } from '../entity';
import type { Relation } from '../relation';
import { RecordStatus } from '../enums';
import {
  mapLegacyEdgeType,
  mapLegacyNodeType,
} from '../graph-rules';

/** Legacy graph shape from relations.json / src/lib/types.ts */
export interface LegacyGraphNode {
  id: string;
  type: 'layer' | 'target' | 'concept';
  label: string;
  data?: Record<string, unknown>;
}

export interface LegacyGraphEdge {
  source: string;
  target: string;
  type: 'belongs-to' | 'competes-with' | 'supplies-to' | 'threatens' | 'relates-to';
  label: string;
}

export interface LegacyGraphData {
  nodes: LegacyGraphNode[];
  edges: LegacyGraphEdge[];
}

const REVERSE_NODE_TYPE: Record<string, LegacyGraphNode['type']> = {
  SupplyChainStage: 'layer',
  Company: 'target',
  Theme: 'concept',
};

const REVERSE_EDGE_TYPE: Record<string, LegacyGraphEdge['type']> = {
  belongs_to: 'belongs-to',
  supplies_to: 'supplies-to',
  competes_with: 'competes-with',
  hurt_by: 'threatens',
  relates_to: 'relates-to',
};

export function entitiesToLegacyNodes(entities: Entity[]): LegacyGraphNode[] {
  return entities
    .filter((e) => REVERSE_NODE_TYPE[e.type])
    .map((e) => ({
      id: e.id,
      type: REVERSE_NODE_TYPE[e.type]!,
      label: e.name,
      data: e.properties,
    }));
}

export function relationsToLegacyEdges(relations: Relation[]): LegacyGraphEdge[] {
  return relations
    .filter((r) => REVERSE_EDGE_TYPE[r.predicate])
    .map((r) => ({
      source: r.subjectEntityId,
      target: r.objectEntityId,
      type: REVERSE_EDGE_TYPE[r.predicate]!,
      label: r.label ?? r.predicate,
    }));
}

export function legacyGraphToStandard(
  graph: LegacyGraphData,
): { entities: Entity[]; relations: Relation[] } {
  const entities: Entity[] = graph.nodes.map((node) => ({
    id: node.id,
    type: mapLegacyNodeType(node.type) as Entity['type'],
    name: node.label,
    slug: node.id,
    aliases: [],
    description: undefined,
    properties: {
      ...node.data,
      legacyNodeType: node.type,
    },
    status: RecordStatus.active,
    source: 'legacy:relations.json',
  }));

  const relations: Relation[] = graph.edges.map((edge, index) => {
    const predicate = mapLegacyEdgeType(edge.type) as Relation['predicate'];
    return {
      id: `rel-${edge.source}-${edge.target}-${index}`,
      subjectEntityId: edge.source,
      predicate,
      objectEntityId: edge.target,
      properties: { legacyEdgeType: edge.type },
      confidence: edge.type === 'relates-to' ? 0.7 : 1,
      status: RecordStatus.active,
      label: edge.label,
    };
  });

  return { entities, relations };
}

export function standardToLegacyGraph(
  entities: Entity[],
  relations: Relation[],
): LegacyGraphData {
  return {
    nodes: entitiesToLegacyNodes(entities),
    edges: relationsToLegacyEdges(relations),
  };
}
