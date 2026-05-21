'use client';

import type { GraphNode, GraphEdge } from '@/lib/types';
import type { ExploreResponse } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const TYPE_LABELS: Record<string, string> = {
  layer: '投资层',
  target: '标的',
  concept: '概念',
};

const MODE_LABELS: Record<string, string> = {
  focus_subgraph: '关系网络',
  supply_chain: '供应链',
  industry_chain: '产业链',
  path_between: '路径追溯',
};

interface ExploreListPanelProps {
  parse: ExploreResponse['parse'];
  parser?: 'rule' | 'llm';
  nodeIds: Set<string>;
  paths?: string[][];
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (id: string) => void;
  selectedNodeId?: string | null;
}

export function ExploreListPanel({
  parse,
  parser,
  nodeIds,
  paths,
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
}: ExploreListPanelProps) {
  const visibleNodes = nodes.filter((n) => nodeIds.has(n.id));
  const visibleEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
  );

  const byType = {
    layer: visibleNodes.filter((n) => n.type === 'layer'),
    target: visibleNodes.filter((n) => n.type === 'target'),
    concept: visibleNodes.filter((n) => n.type === 'concept'),
  };

  const nameById = new Map(nodes.map((n) => [n.id, n.label]));

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4 text-sm">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {MODE_LABELS[parse.mode] ?? parse.mode}
            </Badge>
            {parser && (
              <Badge variant="outline" className="text-[10px]">
                {parser === 'llm' ? 'LLM 解析' : '规则解析'}
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px]">
              {parse.hops} 跳
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{parse.summary}</p>
        </div>

        {paths && paths.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold mb-2">路径 ({paths.length})</h3>
            <ul className="space-y-1.5">
              {paths.slice(0, 8).map((path, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className="w-full text-left rounded-md border border-border px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                    onClick={() => onSelectNode(path[0])}
                  >
                    {path.map((id) => nameById.get(id) ?? id).join(' → ')}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(['layer', 'target', 'concept'] as const).map((type) => {
          const list = byType[type];
          if (list.length === 0) return null;
          return (
            <section key={type}>
              <h3 className="text-xs font-semibold mb-2">
                {TYPE_LABELS[type]} ({list.length})
              </h3>
              <ul className="space-y-1">
                {list.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full text-left rounded-md px-2 py-1 text-xs hover:bg-accent',
                        selectedNodeId === n.id && 'bg-accent font-medium',
                      )}
                      onClick={() => onSelectNode(n.id)}
                    >
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section>
          <h3 className="text-xs font-semibold mb-2">关系 ({visibleEdges.length})</h3>
          <ul className="space-y-1 max-h-48 overflow-y-auto">
            {visibleEdges.map((e, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                <span className="text-foreground">{nameById.get(e.source) ?? e.source}</span>
                <span className="mx-1 text-blue-600 dark:text-blue-400">{e.label}</span>
                <span className="text-foreground">{nameById.get(e.target) ?? e.target}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScrollArea>
  );
}
