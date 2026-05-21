'use client';

import { List, Scale } from 'lucide-react';
import type { ExploreResponse } from '@ai-vantage/contracts';
import type { GraphNode, GraphEdge } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ExploreListPanel } from './explore-list-panel';
import { ExploreAssertionsPanel } from './explore-assertions-panel';

export type ExploreInsightsTab = 'list' | 'assertions';

interface ExploreInsightsPanelProps {
  tab: ExploreInsightsTab;
  onTabChange: (tab: ExploreInsightsTab) => void;
  parse: ExploreResponse['parse'];
  parser?: 'rule' | 'llm';
  nodeIds: Set<string>;
  paths?: string[][];
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (id: string) => void;
  selectedNodeId?: string | null;
  useApi: boolean;
  onClose: () => void;
}

export function ExploreInsightsPanel({
  tab,
  onTabChange,
  parse,
  parser,
  nodeIds,
  paths,
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  useApi,
  onClose,
}: ExploreInsightsPanelProps) {
  const targetIds = [...nodeIds].filter((id) => {
    const n = nodes.find((node) => node.id === id);
    return n?.type === 'target' || n?.type === 'layer';
  });

  return (
    <div className="flex h-full flex-col border-l border-border bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={tab === 'list' ? 'default' : 'ghost'}
            className="h-7 text-xs gap-1"
            onClick={() => onTabChange('list')}
          >
            <List className="size-3.5" />
            列表
          </Button>
          <Button
            size="sm"
            variant={tab === 'assertions' ? 'default' : 'ghost'}
            className="h-7 text-xs gap-1"
            onClick={() => onTabChange('assertions')}
          >
            <Scale className="size-3.5" />
            判断
          </Button>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClose}>
          关闭
        </Button>
      </div>
      <div className="min-h-0 flex-1">
        {tab === 'list' ? (
          <ExploreListPanel
            parse={parse}
            parser={parser}
            nodeIds={nodeIds}
            paths={paths}
            nodes={nodes}
            edges={edges}
            onSelectNode={onSelectNode}
            selectedNodeId={selectedNodeId}
          />
        ) : (
          <ExploreAssertionsPanel entityIds={targetIds} useApi={useApi} />
        )}
      </div>
    </div>
  );
}

/** Full-width list layout (replaces graph canvas). */
export function ExploreListLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-full bg-card">{children}</div>;
}
