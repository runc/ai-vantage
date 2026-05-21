import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocumentSourceType } from '@ai-vantage/kg';
function resolveContentDir(cwd: string): string {
  const candidates = [
    path.join(cwd, 'content'),
    path.join(cwd, '..', '..', 'content'),
    path.join(cwd, '..', '..', '..', 'content'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'graph', 'relations.json'))) return dir;
  }
  throw new Error('content/ directory not found');
}

export type MdxContentKind = 'targets' | 'layers' | 'concepts';

export interface MdxDocumentSource {
  id: string;
  title: string;
  sourceType: typeof DocumentSourceType.platform_article;
  rawText: string;
  sourceUrl: string;
  metadata: {
    kind: MdxContentKind;
    slug: string;
    primaryEntityId: string;
    relatedEntityIds?: string[];
  };
}

export function loadMdxDocument(
  kind: MdxContentKind,
  slug: string,
  cwd?: string,
): MdxDocumentSource | null {
  const contentDir = resolveContentDir(cwd ?? process.cwd());
  const filePath = path.join(contentDir, kind, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fm = data as Record<string, unknown>;
  const entityId = (fm.id as string) ?? slug;

  const related: string[] = [];
  if (Array.isArray(fm.relatedTargets)) related.push(...(fm.relatedTargets as string[]));
  if (Array.isArray(fm.relatedLayers)) related.push(...(fm.relatedLayers as string[]));
  if (typeof fm.layer === 'string') related.push(fm.layer);

  return {
    id: `mdx-${kind}-${slug}`,
    title: (fm.title as string) ?? slug,
    sourceType: DocumentSourceType.platform_article,
    rawText: content.trim(),
    sourceUrl: `/explore/${kind === 'targets' ? 'target' : 'layer'}/${slug}`,
    metadata: {
      kind,
      slug,
      primaryEntityId: entityId,
      relatedEntityIds: [...new Set(related)].filter((id) => id !== entityId),
    },
  };
}
