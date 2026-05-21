'use client';

import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import {
  Search,
  Route,
  Focus,
  RotateCcw,
  Maximize,
  Box,
  LayoutGrid,
} from 'lucide-react';

export type GraphViewMode = '2d' | '3d';

interface GraphToolbarProps {
  viewMode: GraphViewMode;
  onViewModeChange: (mode: GraphViewMode) => void;
  onFitView: () => void;
  onResetLayout: () => void;
  /** Search */
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: Array<{ id: string; label: string; type: string }>;
  onSearchSelect: (nodeId: string) => void;
  /** Path finder */
  onOpenPathFinder: () => void;
  /** Focus mode */
  focusMode: boolean;
  focusHops: number;
  onFocusHopsChange: (hops: number) => void;
}

function GraphToolbarContent({
  viewMode,
  onViewModeChange,
  onFitView,
  onResetLayout,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchSelect,
  onOpenPathFinder,
  focusMode,
  focusHops,
  onFocusHopsChange,
}: GraphToolbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/95 backdrop-blur-sm p-1.5 shadow-lg">
      {/* View mode toggle */}
      <div className="flex items-center rounded-md bg-muted p-0.5">
        <Button
          variant={viewMode === '2d' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs gap-1"
          onClick={() => onViewModeChange('2d')}
        >
          <LayoutGrid className="size-3.5" />
          2D
        </Button>
        <Button
          variant={viewMode === '3d' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2.5 text-xs gap-1"
          onClick={() => onViewModeChange('3d')}
        >
          <Box className="size-3.5" />
          3D
        </Button>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Search */}
      <div className="relative">
        <Button
          variant={searchOpen ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setSearchOpen(!searchOpen)}
          title="搜索节点"
        >
          <Search className="size-3.5" />
        </Button>
        {searchOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-64 rounded-lg border border-border bg-background shadow-xl p-2 z-50">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索公司、层级、概念..."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            {searchQuery && searchResults.length > 0 && (
              <div className="mt-1.5 max-h-48 overflow-y-auto divide-y divide-border">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-left text-sm hover:bg-accent rounded transition-colors"
                    onClick={() => {
                      onSearchSelect(result.id);
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                  >
                    <span
                      className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                        result.type === 'layer'
                          ? 'bg-emerald-500'
                          : result.type === 'target'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                      }`}
                    />
                    <span className="truncate text-foreground">{result.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
                      {result.type === 'layer' ? '层' : result.type === 'target' ? '标的' : '概念'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground text-center py-2">
                未找到匹配结果
              </p>
            )}
          </div>
        )}
      </div>

      {/* Path finder */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onOpenPathFinder}
        title="路径发现"
      >
        <Route className="size-3.5" />
      </Button>

      {/* Focus mode indicator */}
      {focusMode && (
        <>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5">
            <Focus className="size-3 text-blue-500" />
            <span className="text-[10px] font-medium text-blue-500">聚焦</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[1, 2, 3].map((h) => (
                <button
                  key={h}
                  className={`w-4 h-4 rounded text-[9px] font-bold transition-colors ${
                    focusHops === h
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                  onClick={() => onFocusHopsChange(h)}
                  title={`${h} 跳`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="w-px h-5 bg-border" />

      {/* Fit view */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onFitView}
        title="适配视图"
      >
        <Maximize className="size-3.5" />
      </Button>

      {/* Reset */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onResetLayout}
        title="重置"
      >
        <RotateCcw className="size-3.5" />
      </Button>
    </div>
  );
}

/** Used inside ReactFlow (2D mode) — wrapped with Panel */
export function GraphToolbar(props: GraphToolbarProps) {
  return (
    <Panel position="top-right" className="!m-3">
      <GraphToolbarContent {...props} />
    </Panel>
  );
}

/** Used outside ReactFlow (3D mode) — plain div, positioned by parent */
export function GraphToolbar3D(props: GraphToolbarProps) {
  return <GraphToolbarContent {...props} />;
}
