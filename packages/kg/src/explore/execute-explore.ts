import { getNHopNeighbors, findAllPaths } from '../graph-algorithms';
import type {
  ExploreEdgeLike,
  ExploreEntityLike,
  ExploreGraphResult,
} from './types';
import { parseExploreQuery, type ParseQueryOptions } from './parse-query';
import type { ExploreParseResult } from './types';

const SUPPLY_EDGE_TYPES = new Set([
  'supplies-to',
  'supplies_to',
  'upstream_of',
  'downstream_of',
  'depends_on',
  'belongs-to',
  'belongs_to',
]);

function edgeKey(e: ExploreEdgeLike): string {
  return e.id ?? `${e.source}>${e.target}>${e.type ?? e.predicate ?? ''}`;
}

export function runExploreFromParse(
  parse: ExploreParseResult,
  entities: ExploreEntityLike[],
  relations: ExploreEdgeLike[],
): ExploreGraphResult {
  if (parse.mode === 'industry_chain' && parse.layerIds?.length) {
    const layerSet = new Set(parse.layerIds);
    const nodeIds = new Set<string>(parse.layerIds);
    const relationIds = new Set<string>();
    for (const r of relations) {
      const inLayer =
        layerSet.has(r.source) ||
        layerSet.has(r.target) ||
        (entities.find((e) => e.id === r.source)?.legacyNodeType === 'target' &&
          layerSet.has(r.target)) ||
        (entities.find((e) => e.id === r.target)?.legacyNodeType === 'target' &&
          layerSet.has(r.source));
      if (
        inLayer &&
        (r.type === 'belongs-to' ||
          r.predicate === 'belongs_to' ||
          layerSet.has(r.source) ||
          layerSet.has(r.target))
      ) {
        relationIds.add(edgeKey(r));
        nodeIds.add(r.source);
        nodeIds.add(r.target);
      }
    }
    for (const e of entities) {
      if (e.legacyNodeType === 'target') {
        const belongs = relations.find(
          (r) =>
            (r.source === e.id || r.target === e.id) &&
            (r.type === 'belongs-to' || r.predicate === 'belongs_to'),
        );
        if (belongs) {
          const layerId = belongs.source === e.id ? belongs.target : belongs.source;
          if (layerSet.has(layerId)) nodeIds.add(e.id);
        }
      }
    }
    return {
      parse,
      nodeIds: [...nodeIds],
      relationIds: [...relationIds],
    };
  }

  if (parse.mode === 'path_between' && parse.focus && parse.pathEnd) {
    const paths = findAllPaths(
      relations.map((r) => ({ source: r.source, target: r.target })),
      parse.focus.id,
      parse.pathEnd.id,
      Math.min(parse.hops + 2, 6),
    );
    const nodeIds = new Set<string>();
    const relationIds = new Set<string>();
    for (const path of paths) {
      for (const nid of path) nodeIds.add(nid);
      for (let i = 0; i < path.length - 1; i++) {
        const a = path[i];
        const b = path[i + 1];
        for (const r of relations) {
          if (
            (r.source === a && r.target === b) ||
            (r.source === b && r.target === a)
          ) {
            relationIds.add(edgeKey(r));
          }
        }
      }
    }
    return {
      parse,
      nodeIds: [...nodeIds],
      relationIds: [...relationIds],
      paths,
    };
  }

  const focusId = parse.focus?.id;
  if (!focusId) {
    return { parse, nodeIds: [], relationIds: [] };
  }

  const edgeLikes = relations.map((r) => ({
    id: edgeKey(r),
    source: r.source,
    target: r.target,
  }));

  let { nodeIds, relationIds } = getNHopNeighbors(edgeLikes, focusId, parse.hops);

  if (parse.mode === 'supply_chain') {
    const filteredRel = new Set<string>();
    const filteredNodes = new Set<string>([focusId]);
    for (const r of relations) {
      const key = edgeKey(r);
      if (!relationIds.has(key)) continue;
      const type = (r.type ?? r.predicate ?? '').toLowerCase().replace(/_/g, '-');
      if (!SUPPLY_EDGE_TYPES.has(type) && !SUPPLY_EDGE_TYPES.has(r.predicate ?? '')) {
        continue;
      }
      filteredRel.add(key);
      filteredNodes.add(r.source);
      filteredNodes.add(r.target);
    }
    nodeIds = filteredNodes;
    relationIds = filteredRel;
  }

  return {
    parse,
    nodeIds: [...nodeIds],
    relationIds: [...relationIds],
  };
}

export function executeExplore(
  query: string,
  entities: ExploreEntityLike[],
  relations: ExploreEdgeLike[],
  options?: Partial<ParseQueryOptions>,
): ExploreGraphResult {
  const parse = parseExploreQuery(query, {
    entities,
    layerIds: options?.layerIds,
  });
  return runExploreFromParse(parse, entities, relations);
}
