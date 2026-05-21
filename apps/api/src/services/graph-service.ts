import { GraphRepository } from '@ai-vantage/db';
import { runExploreFromParse, executeExplore } from '@ai-vantage/kg';
import { resolveExploreParse } from '@ai-vantage/ai';
import type { ExploreResponse } from '@ai-vantage/contracts';

export class GraphService {
  constructor(private graphRepo: GraphRepository) {}

  async explore(query: string, options?: { useLlm?: boolean }): Promise<ExploreResponse> {
    const full = await this.graphRepo.getFullGraph();
    const entities = full.entities.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      properties: e.properties,
      legacyNodeType: e.legacyNodeType,
    }));
    const relations = full.relations.map((r) => ({
      id: r.id,
      source: r.subjectEntityId,
      target: r.objectEntityId,
      type: r.legacyEdgeType,
      predicate: r.predicate,
    }));

    const { parse, parser } = options?.useLlm
      ? await resolveExploreParse(query, entities, { preferLlm: true })
      : { parse: executeExplore(query, entities, relations).parse, parser: 'rule' as const };

    const result = runExploreFromParse(parse, entities, relations);
    const nodeSet = new Set(result.nodeIds);
    const relSet = new Set(result.relationIds);

    const graph = {
      entities: full.entities.filter((e) => nodeSet.has(e.id)),
      relations: full.relations.filter((r) => relSet.has(r.id)),
    };

    return {
      parse: result.parse,
      parser,
      graph,
      nodeIds: result.nodeIds,
      paths: result.paths,
    };
  }

  getFullGraph() {
    return this.graphRepo.getFullGraph();
  }

  getSubgraph(entityId: string, hops: number) {
    return this.graphRepo.getSubgraph(entityId, hops);
  }

  search(query: string, limit: number) {
    return this.graphRepo.search(query, limit);
  }

  findPaths(startId: string, endId: string, maxDepth: number) {
    return this.graphRepo.findPaths(startId, endId, maxDepth);
  }

  getNeighbors(entityId: string, hops: number) {
    return this.graphRepo.getNeighbors(entityId, hops);
  }
}
