import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { LegacyGraphData } from '../adapters/legacy-graph';

export interface LayerFrontmatter {
  id: string;
  title: string;
  type: 'layer';
  rank: number;
  certainty: string;
  summary: string;
  representatives: string[];
  relatedConcepts: string[];
}

export interface TargetFrontmatter {
  id: string;
  title: string;
  titleZh?: string;
  type: 'target';
  layer: string;
  moat: string;
  risk: string;
  marketPosition: string;
}

export interface ConceptFrontmatter {
  id: string;
  title: string;
  type: 'concept';
  relatedLayers: string[];
  relatedTargets: string[];
}

function loadMdxDir<T>(contentDir: string, subdir: string): Array<{ frontmatter: T; slug: string }> {
  const dir = path.join(contentDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
      const { data } = matter(raw);
      return {
        frontmatter: data as T,
        slug: filename.replace(/\.mdx$/, ''),
      };
    });
}

export function loadRelationsJson(contentDir: string): LegacyGraphData {
  const filePath = path.join(contentDir, 'graph', 'relations.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as LegacyGraphData;
}

export function loadContentEnrichment(contentDir: string): {
  layers: Array<{ frontmatter: LayerFrontmatter; slug: string }>;
  targets: Array<{ frontmatter: TargetFrontmatter; slug: string }>;
  concepts: Array<{ frontmatter: ConceptFrontmatter; slug: string }>;
} {
  const layers = loadMdxDir<LayerFrontmatter>(contentDir, 'layers');
  layers.sort((a, b) => a.frontmatter.rank - b.frontmatter.rank);
  return {
    layers,
    targets: loadMdxDir<TargetFrontmatter>(contentDir, 'targets'),
    concepts: loadMdxDir<ConceptFrontmatter>(contentDir, 'concepts'),
  };
}

export function resolveContentDir(cwd: string = process.cwd()): string {
  const candidates = [
    path.join(cwd, 'content'),
    path.join(cwd, '..', '..', 'content'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'graph', 'relations.json'))) {
      return dir;
    }
  }
  throw new Error('content directory not found (expected content/graph/relations.json)');
}
