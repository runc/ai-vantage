export type ExploreMode =
  | 'focus_subgraph'
  | 'supply_chain'
  | 'industry_chain'
  | 'path_between';

export interface ExploreEntityRef {
  id: string;
  name: string;
  legacyNodeType?: 'layer' | 'target' | 'concept';
}

export interface ExploreParseResult {
  mode: ExploreMode;
  hops: number;
  /** Resolved primary focus (first match) */
  focus?: ExploreEntityRef;
  /** Secondary entity for path mode */
  pathEnd?: ExploreEntityRef;
  /** All layer nodes for industry_chain */
  layerIds?: string[];
  /** Human-readable explanation */
  summary: string;
  /** Unresolved remainder */
  rawQuery: string;
}

export interface ExploreEdgeLike {
  id?: string;
  source: string;
  target: string;
  type?: string;
  predicate?: string;
}

export interface ExploreEntityLike {
  id: string;
  name: string;
  slug?: string;
  aliases?: string[];
  properties?: Record<string, unknown>;
  legacyNodeType?: 'layer' | 'target' | 'concept';
}

export interface ExploreGraphResult {
  parse: ExploreParseResult;
  nodeIds: string[];
  relationIds: string[];
  paths?: string[][];
}
