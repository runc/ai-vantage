/**
 * UI view model for the knowledge graph (React Flow / 3D).
 * Decoupled from @ai-vantage/kg domain types.
 */
export type ViewNodeType = 'layer' | 'target' | 'concept';

export type ViewEdgeType =
  | 'belongs-to'
  | 'competes-with'
  | 'supplies-to'
  | 'threatens'
  | 'relates-to';

export interface ViewNode {
  id: string;
  type: ViewNodeType;
  label: string;
  data?: Record<string, unknown>;
}

export interface ViewEdge {
  source: string;
  target: string;
  type: ViewEdgeType;
  label: string;
}

export interface GraphViewData {
  nodes: ViewNode[];
  edges: ViewEdge[];
}

/** @deprecated Use ViewNode — alias for gradual migration */
export type GraphNode = ViewNode;

/** @deprecated Use ViewEdge */
export type GraphEdge = ViewEdge;

/** @deprecated Use GraphViewData */
export type GraphData = GraphViewData;
