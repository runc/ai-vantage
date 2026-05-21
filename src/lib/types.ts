export interface ChangelogEntry {
  date: string;
  note: string;
}

export interface LayerFrontmatter {
  id: string;
  title: string;
  type: 'layer';
  rank: number;
  certainty: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  summary: string;
  representatives: string[];
  relatedConcepts: string[];
  changelog: ChangelogEntry[];
}

export interface TargetFrontmatter {
  id: string;
  title: string;
  titleZh?: string;
  type: 'target';
  layer: string;
  subgroup?: string;
  moat: string;
  risk: string;
  marketPosition: string;
  relatedTargets: string[];
  changelog: ChangelogEntry[];
}

export interface ConceptFrontmatter {
  id: string;
  title: string;
  type: 'concept';
  relatedLayers: string[];
  relatedTargets: string[];
  changelog: ChangelogEntry[];
}

export interface ContentItem<T> {
  frontmatter: T;
  content: string; // raw MDX content
  slug: string;
}

export type LayerItem = ContentItem<LayerFrontmatter>;
export type TargetItem = ContentItem<TargetFrontmatter>;
export type ConceptItem = ContentItem<ConceptFrontmatter>;

export type {
  ViewNode as GraphNode,
  ViewEdge as GraphEdge,
  GraphViewData as GraphData,
  ViewNodeType,
  ViewEdgeType,
} from './graph-view-model';
