import type { ExploreEntityLike, ExploreParseResult } from './types';
import { buildAliasIndex, resolveEntity } from './alias-index';

const SUPPLY_CHAIN_RE =
  /上下游|供应链|上游|下游|供给|供应|产业链上下游/;
const INDUSTRY_CHAIN_RE = /产业链|产业图谱|产业网络|投资地图|ai\s*产业|ai产业链/i;
const PATH_RE = /(.+?)(?:到|至|→|->)(.+)/;
const HOPS_RE = /(\d)\s*跳|(\d)\s*hop|间接/;
const UPSTREAM_RE = /上游/;
const DOWNSTREAM_RE = /下游/;

export interface ParseQueryOptions {
  entities: ExploreEntityLike[];
  /** All layer entity ids (for industry_chain) */
  layerIds?: string[];
}

function stripIntentPhrases(text: string): string {
  return text
    .replace(SUPPLY_CHAIN_RE, ' ')
    .replace(INDUSTRY_CHAIN_RE, ' ')
    .replace(/探索|查询|看看|显示|打开|图谱|关系|网络/g, ' ')
    .replace(HOPS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseHops(text: string, defaultHops: number): number {
  const m = text.match(HOPS_RE);
  if (m) {
    const n = Number(m[1] ?? m[2]);
    if (n >= 1 && n <= 3) return n;
  }
  if (/间接|两层|两层/.test(text)) return 2;
  if (UPSTREAM_RE.test(text) && DOWNSTREAM_RE.test(text)) return 2;
  return defaultHops;
}

export function parseExploreQuery(
  rawQuery: string,
  options: ParseQueryOptions,
): ExploreParseResult {
  const q = rawQuery.trim();
  const hops = parseHops(q, 2);
  const index = buildAliasIndex(options.entities);
  const layerIds =
    options.layerIds ??
    options.entities.filter((e) => e.legacyNodeType === 'layer').map((e) => e.id);

  // Path: A 到 B
  const pathMatch = q.match(PATH_RE);
  if (pathMatch) {
    const start = resolveEntity(stripIntentPhrases(pathMatch[1]), index);
    const end = resolveEntity(stripIntentPhrases(pathMatch[2]), index);
    if (start && end) {
      return {
        mode: 'path_between',
        hops,
        focus: { id: start.id, name: start.name, legacyNodeType: start.legacyNodeType },
        pathEnd: { id: end.id, name: end.name, legacyNodeType: end.legacyNodeType },
        summary: `路径：${start.name} → ${end.name}（最多 ${hops} 跳）`,
        rawQuery: q,
      };
    }
  }

  // Industry chain
  if (INDUSTRY_CHAIN_RE.test(q) && !SUPPLY_CHAIN_RE.test(q)) {
    return {
      mode: 'industry_chain',
      hops: 1,
      layerIds,
      summary: `AI 产业链全景（${layerIds.length} 个层级）`,
      rawQuery: q,
    };
  }

  const entityText = stripIntentPhrases(q);
  const focus = resolveEntity(entityText, index);

  if (SUPPLY_CHAIN_RE.test(q) && focus) {
    return {
      mode: 'supply_chain',
      hops,
      focus: { id: focus.id, name: focus.name, legacyNodeType: focus.legacyNodeType },
      summary: `${focus.name} 供应链上下游（${hops} 跳）`,
      rawQuery: q,
    };
  }

  if (focus) {
    return {
      mode: 'focus_subgraph',
      hops,
      focus: { id: focus.id, name: focus.name, legacyNodeType: focus.legacyNodeType },
      summary: `${focus.name} 周边关系（${hops} 跳）`,
      rawQuery: q,
    };
  }

  return {
    mode: 'focus_subgraph',
    hops,
    summary: entityText ? `未识别实体「${entityText}」，请换关键词` : '请输入公司名或产业链',
    rawQuery: q,
  };
}
