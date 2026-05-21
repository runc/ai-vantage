import type { GraphQueryResponse, GraphEntityDto, GraphRelationDto } from '@ai-vantage/contracts';
import { filterActiveGraph } from '@ai-vantage/kg';
import type { Database } from '../client.js';
import { findAllPaths, getNHopNeighbors } from '../graph-algorithms.js';
import { EntityRepository } from './entity-repository.js';
import { RelationRepository } from './relation-repository.js';

const REVERSE_EDGE: Record<string, GraphRelationDto['legacyEdgeType']> = {
  belongs_to: 'belongs-to',
  supplies_to: 'supplies-to',
  competes_with: 'competes-with',
  hurt_by: 'threatens',
  relates_to: 'relates-to',
};

const REVERSE_NODE: Record<string, GraphEntityDto['legacyNodeType']> = {
  SupplyChainStage: 'layer',
  Company: 'target',
  Theme: 'concept',
};

function toEntityDto(entity: Awaited<ReturnType<EntityRepository['findAllActive']>>[0]): GraphEntityDto {
  const legacy = (entity.properties?.legacyNodeType as GraphEntityDto['legacyNodeType']) ??
    REVERSE_NODE[entity.type];
  return {
    id: entity.id,
    type: entity.type,
    name: entity.name,
    slug: entity.slug,
    properties: entity.properties,
    legacyNodeType: legacy,
  };
}

function toRelationDto(
  relation: Awaited<ReturnType<RelationRepository['findAllActive']>>[0],
): GraphRelationDto {
  const legacy =
    (relation.properties?.legacyEdgeType as GraphRelationDto['legacyEdgeType']) ??
    REVERSE_EDGE[relation.predicate];
  return {
    id: relation.id,
    subjectEntityId: relation.subjectEntityId,
    predicate: relation.predicate,
    objectEntityId: relation.objectEntityId,
    label: relation.label,
    confidence: relation.confidence,
    legacyEdgeType: legacy,
  };
}

export class GraphRepository {
  private entities: EntityRepository;
  private relations: RelationRepository;

  constructor(db: Database) {
    this.entities = new EntityRepository(db);
    this.relations = new RelationRepository(db);
  }

  async getFullGraph(): Promise<GraphQueryResponse> {
    const allEntities = await this.entities.findAllActive();
    const allRelations = await this.relations.findAllActive();
    const { entities, relations } = filterActiveGraph(allEntities, allRelations);
    return {
      entities: entities.map(toEntityDto),
      relations: relations.map(toRelationDto),
    };
  }

  async getSubgraph(entityId: string, hops: number): Promise<GraphQueryResponse> {
    const allRelations = await this.relations.findAllActive();
    const edgeLikes = allRelations.map((r) => ({
      id: r.id,
      source: r.subjectEntityId,
      target: r.objectEntityId,
    }));
    const { nodeIds, relationIds } = getNHopNeighbors(edgeLikes, entityId, hops);
    const entities = await this.entities.findByIds([...nodeIds]);
    const relations = allRelations.filter((r) => relationIds.has(r.id));
    return {
      entities: entities.map(toEntityDto),
      relations: relations.map(toRelationDto),
    };
  }

  async search(query: string, limit = 20): Promise<GraphQueryResponse> {
    const matched = await this.entities.search(query, limit);
    const ids = new Set(matched.map((e) => e.id));
    const allRelations = await this.relations.findAllActive();
    const relations = allRelations.filter(
      (r) => ids.has(r.subjectEntityId) || ids.has(r.objectEntityId),
    );
    const extraIds = new Set<string>();
    for (const r of relations) {
      extraIds.add(r.subjectEntityId);
      extraIds.add(r.objectEntityId);
    }
    const allIds = new Set([...ids, ...extraIds]);
    const entities = await this.entities.findByIds([...allIds]);
    return {
      entities: entities.map(toEntityDto),
      relations: relations.map(toRelationDto),
    };
  }

  async findPaths(
    startId: string,
    endId: string,
    maxDepth = 5,
  ): Promise<string[][]> {
    const allRelations = await this.relations.findAllActive();
    const edgeLikes = allRelations.map((r) => ({
      source: r.subjectEntityId,
      target: r.objectEntityId,
    }));
    return findAllPaths(edgeLikes, startId, endId, maxDepth);
  }

  async getNeighbors(
    entityId: string,
    hops: number,
  ): Promise<{ entityId: string; nodeIds: string[]; relationIds: string[] }> {
    const allRelations = await this.relations.findAllActive();
    const edgeLikes = allRelations.map((r) => ({
      id: r.id,
      source: r.subjectEntityId,
      target: r.objectEntityId,
    }));
    const { nodeIds, relationIds } = getNHopNeighbors(edgeLikes, entityId, hops);
    return {
      entityId,
      nodeIds: [...nodeIds],
      relationIds: [...relationIds],
    };
  }
}
