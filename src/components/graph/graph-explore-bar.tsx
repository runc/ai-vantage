'use client';

import { useState } from 'react';
import { Search, Sparkles, X, LayoutGrid, List, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXPLORE_PRESETS } from '@/lib/explore-client';
import { cn } from '@/lib/utils';

export type ExploreLayoutMode = 'graph' | 'list';

interface GraphExploreBarProps {
  onExplore: (query: string) => void;
  onClear: () => void;
  summary: string | null;
  parser?: 'rule' | 'llm' | null;
  loading?: boolean;
  layoutMode: ExploreLayoutMode;
  onLayoutModeChange: (mode: ExploreLayoutMode) => void;
  useLlm: boolean;
  onUseLlmChange: (v: boolean) => void;
  canUseLlm?: boolean;
}

export function GraphExploreBar({
  onExplore,
  onClear,
  summary,
  parser,
  loading,
  layoutMode,
  onLayoutModeChange,
  useLlm,
  onUseLlmChange,
  canUseLlm = false,
}: GraphExploreBarProps) {
  const [query, setQuery] = useState('');

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    onExplore(q);
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/95 backdrop-blur-sm p-2 shadow-lg w-full max-w-2xl">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="自然语言探索，如：英伟达 上下游、AI产业链"
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button size="sm" className="h-8 shrink-0" disabled={loading || !query.trim()} onClick={submit}>
          <Search className="size-3.5 mr-1" />
          探索
        </Button>
        {summary && (
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onClear} aria-label="清除">
            <X className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md bg-muted p-0.5">
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px]',
              layoutMode === 'graph' && 'bg-background shadow-sm',
            )}
            onClick={() => onLayoutModeChange('graph')}
          >
            <LayoutGrid className="size-3" />
            图谱
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px]',
              layoutMode === 'list' && 'bg-background shadow-sm',
            )}
            onClick={() => onLayoutModeChange('list')}
          >
            <List className="size-3" />
            列表
          </button>
        </div>

        {canUseLlm && (
          <button
            type="button"
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] transition-colors',
              useLlm
                ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'border-border text-muted-foreground hover:bg-accent',
            )}
            onClick={() => onUseLlmChange(!useLlm)}
          >
            <Brain className="size-3" />
            LLM 解析
          </button>
        )}

        {parser && (
          <span className="text-[10px] text-muted-foreground">
            {parser === 'llm' ? 'LLM' : '规则'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {EXPLORE_PRESETS.map((p) => (
          <button
            key={p.query}
            type="button"
            className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={() => {
              setQuery(p.query);
              onExplore(p.query);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {summary && (
        <p className="text-xs text-muted-foreground border-t border-border pt-2 leading-relaxed">
          {summary}
        </p>
      )}
    </div>
  );
}
