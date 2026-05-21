import type { ExploreParseResult } from '@ai-vantage/kg';
import { parseExploreQuery, type ExploreEntityLike } from '@ai-vantage/kg';

export interface LlmExploreIntentJson {
  mode: 'focus_subgraph' | 'supply_chain' | 'industry_chain' | 'path_between';
  hops?: number;
  focusEntityId?: string;
  pathEndEntityId?: string;
  summary?: string;
}

const VALID_MODES = new Set<LlmExploreIntentJson['mode']>([
  'focus_subgraph',
  'supply_chain',
  'industry_chain',
  'path_between',
]);

function buildEntityCatalog(entities: ExploreEntityLike[]): string {
  return entities
    .slice(0, 80)
    .map((e) => `${e.id}:${e.name}${e.legacyNodeType ? `(${e.legacyNodeType})` : ''}`)
    .join('\n');
}

export async function parseExploreIntentLlm(
  query: string,
  entities: ExploreEntityLike[],
): Promise<ExploreParseResult | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const baseUrl = process.env.OPENAI_BASE_URL?.trim() || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini';

  const system = `You parse investment knowledge graph exploration queries.
Return ONLY valid JSON with keys: mode, hops (1-3), focusEntityId, pathEndEntityId (path mode only), summary (Chinese).
mode must be one of: focus_subgraph, supply_chain, industry_chain, path_between.
Use entity ids from the catalog exactly.`;

  const user = `Catalog:\n${buildEntityCatalog(entities)}\n\nQuery: ${query}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as LlmExploreIntentJson;
    if (!VALID_MODES.has(parsed.mode)) return null;

    const hops = Math.min(3, Math.max(1, parsed.hops ?? 2));
    const focus = parsed.focusEntityId
      ? entities.find((e) => e.id === parsed.focusEntityId)
      : undefined;
    const pathEnd = parsed.pathEndEntityId
      ? entities.find((e) => e.id === parsed.pathEndEntityId)
      : undefined;

    const layerIds = entities.filter((e) => e.legacyNodeType === 'layer').map((e) => e.id);

    return {
      mode: parsed.mode,
      hops,
      focus: focus
        ? {
            id: focus.id,
            name: focus.name,
            legacyNodeType: focus.legacyNodeType,
          }
        : undefined,
      pathEnd: pathEnd
        ? {
            id: pathEnd.id,
            name: pathEnd.name,
            legacyNodeType: pathEnd.legacyNodeType,
          }
        : undefined,
      layerIds: parsed.mode === 'industry_chain' ? layerIds : undefined,
      summary: parsed.summary ?? `LLM: ${query}`,
      rawQuery: query,
    };
  } catch {
    return null;
  }
}

/** Prefer LLM parse when available; fall back to rules. */
export async function resolveExploreParse(
  query: string,
  entities: ExploreEntityLike[],
  options?: { layerIds?: string[]; preferLlm?: boolean },
): Promise<{ parse: ExploreParseResult; parser: 'rule' | 'llm' }> {
  const ruleParse = parseExploreQuery(query, { entities, layerIds: options?.layerIds });
  if (!options?.preferLlm) {
    return { parse: ruleParse, parser: 'rule' };
  }
  const llmParse = await parseExploreIntentLlm(query, entities);
  if (llmParse?.focus || llmParse?.mode === 'industry_chain' || llmParse?.pathEnd) {
    return { parse: llmParse, parser: 'llm' };
  }
  return { parse: ruleParse, parser: 'rule' };
}
