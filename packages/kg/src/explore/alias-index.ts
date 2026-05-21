import type { ExploreEntityLike } from './types';

export interface AliasEntry {
  id: string;
  name: string;
  legacyNodeType?: 'layer' | 'target' | 'concept';
  tokens: string[];
}

/** Extra aliases not always in DB (Chinese names, tickers). */
const EXTRA_ALIASES: Record<string, string[]> = {
  nvidia: ['英伟达', 'nvda', 'nvdia'],
  tsmc: ['台积电', 'tsmc'],
  amd: ['超威', 'amd'],
  asml: ['阿斯麦', 'asml'],
  'sk-hynix': ['海力士', 'sk海力士', 'sk-hynix'],
  openai: ['openai', 'open ai'],
  google: ['谷歌', 'google', 'alphabet'],
  microsoft: ['微软', 'microsoft'],
  meta: ['meta', 'facebook', '脸书'],
  'physical-engineering': ['物理工程', '物理工程层'],
  'chip-design': ['芯片设计', '芯片设计层'],
  'cloud-platform': ['云平台', '云服务', '云平台的'],
  'application-model': ['应用模型', '应用与模型'],
  oligopoly: ['寡头', '寡头垄断'],
  'middle-squeeze': ['中间挤压'],
  'zero-barrier': ['零壁垒'],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function buildAliasIndex(entities: ExploreEntityLike[]): AliasEntry[] {
  return entities.map((e) => {
    const titleZh = e.properties?.titleZh as string | undefined;
    const extra = EXTRA_ALIASES[e.id] ?? [];
    const tokens = new Set<string>([
      e.id.toLowerCase(),
      e.name.toLowerCase(),
      ...(e.slug ? [e.slug.toLowerCase()] : []),
      ...(e.aliases ?? []).map((a) => a.toLowerCase()),
      ...(titleZh ? tokenize(titleZh) : []),
      ...extra.map((a) => a.toLowerCase()),
      ...tokenize(e.name),
    ]);
    return {
      id: e.id,
      name: e.name,
      legacyNodeType: e.legacyNodeType,
      tokens: [...tokens],
    };
  });
}

export function resolveEntity(
  query: string,
  index: AliasEntry[],
): AliasEntry | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;

  // Exact id
  const byId = index.find((e) => e.id.toLowerCase() === q);
  if (byId) return byId;

  // Exact token match on name
  const exact = index.find((e) => e.name.toLowerCase() === q);
  if (exact) return exact;

  // Substring on name or id
  const contains = index.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      q.includes(e.name.toLowerCase()) ||
      e.tokens.some((t) => t === q || (t.length >= 2 && q.includes(t))),
  );
  if (contains.length === 1) return contains[0];
  if (contains.length > 1) {
    return contains.sort((a, b) => a.name.length - b.name.length)[0];
  }

  return undefined;
}
