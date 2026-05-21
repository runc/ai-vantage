import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  ContentItem,
  LayerItem,
  TargetItem,
  ConceptItem,
  GraphData,
  LayerFrontmatter,
} from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Generic MDX file loader. Reads all .mdx files in a subdirectory,
 * parses frontmatter with gray-matter, and returns typed ContentItems.
 */
function loadMdxFiles<T>(subdir: string): ContentItem<T>[] {
  const dir = path.join(CONTENT_DIR, subdir);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));

  return files.map((filename) => {
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = filename.replace(/\.mdx$/, '');

    return {
      frontmatter: data as T,
      content,
      slug,
    };
  });
}

// Module-level caches for repeated access within a single server render
let layersCache: LayerItem[] | null = null;
let targetsCache: TargetItem[] | null = null;
let conceptsCache: ConceptItem[] | null = null;
let relationsCache: GraphData | null = null;

/**
 * Get all layer items sorted by rank (ascending).
 */
export function getAllLayers(): LayerItem[] {
  if (layersCache) return layersCache;

  const layers = loadMdxFiles<LayerFrontmatter>('layers');
  layers.sort((a, b) => a.frontmatter.rank - b.frontmatter.rank);
  layersCache = layers;
  return layers;
}

/**
 * Get a single layer by its slug (filename without .mdx).
 */
export function getLayerBySlug(slug: string): LayerItem | null {
  const layers = getAllLayers();
  return layers.find((l) => l.slug === slug) ?? null;
}

/**
 * Get all target items.
 */
export function getAllTargets(): TargetItem[] {
  if (targetsCache) return targetsCache;

  const targets = loadMdxFiles<TargetItem['frontmatter']>('targets');
  targetsCache = targets;
  return targets;
}

/**
 * Get a single target by its slug.
 */
export function getTargetBySlug(slug: string): TargetItem | null {
  const targets = getAllTargets();
  return targets.find((t) => t.slug === slug) ?? null;
}

/**
 * Get all targets belonging to a specific layer.
 */
export function getTargetsByLayer(layerSlug: string): TargetItem[] {
  const targets = getAllTargets();
  return targets.filter((t) => t.frontmatter.layer === layerSlug);
}

/**
 * Get all concept items.
 */
export function getAllConcepts(): ConceptItem[] {
  if (conceptsCache) return conceptsCache;

  const concepts = loadMdxFiles<ConceptItem['frontmatter']>('concepts');
  conceptsCache = concepts;
  return concepts;
}

/**
 * Get a single concept by its slug.
 */
export function getConceptBySlug(slug: string): ConceptItem | null {
  const concepts = getAllConcepts();
  return concepts.find((c) => c.slug === slug) ?? null;
}

/**
 * Load the graph relations from content/graph/relations.json.
 * Returns an empty GraphData structure if the file doesn't exist.
 */
export function getRelations(): GraphData {
  if (relationsCache) return relationsCache;

  const filePath = path.join(CONTENT_DIR, 'graph', 'relations.json');

  if (!fs.existsSync(filePath)) {
    return { nodes: [], edges: [] };
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as GraphData;
  relationsCache = data;
  return data;
}

/**
 * Get all slugs for a given content type.
 */
export function getAllSlugs(type: 'layers' | 'targets' | 'concepts'): string[] {
  const dir = path.join(CONTENT_DIR, type);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

/**
 * Invalidate all caches. Useful for development or when content changes.
 */
export function invalidateCache(): void {
  layersCache = null;
  targetsCache = null;
  conceptsCache = null;
  relationsCache = null;
}
