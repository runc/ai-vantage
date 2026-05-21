'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Route, ArrowRight } from 'lucide-react';

interface PathFinderProps {
  nodes: Array<{ id: string; label: string; type: string }>;
  onFindPath: (startId: string, endId: string) => Promise<string[][] | null>;
  onHighlightPath: (path: string[] | null) => void;
  onClose: () => void;
}

export function PathFinder({ nodes, onFindPath, onHighlightPath, onClose }: PathFinderProps) {
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [paths, setPaths] = useState<string[][] | null>(null);
  const [activePath, setActivePath] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nodeMap = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN')),
    [nodes]
  );

  const handleFind = async () => {
    if (!startNode || !endNode || startNode === endNode) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onFindPath(startNode, endNode);
      setPaths(result);
      setActivePath(null);
      onHighlightPath(null);
    } catch {
      setError('路径查询失败');
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPath = (index: number) => {
    if (!paths) return;
    setActivePath(index);
    onHighlightPath(paths[index]);
  };

  const handleClear = () => {
    setPaths(null);
    setActivePath(null);
    onHighlightPath(null);
  };

  return (
    <div className="absolute left-3 top-16 z-50 w-72 rounded-lg border border-border bg-background/95 backdrop-blur-sm shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Route className="size-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">路径发现</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="size-3.5" />
        </Button>
      </div>

      {/* Selection */}
      <div className="p-3 space-y-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            起点
          </label>
          <select
            value={startNode}
            onChange={(e) => { setStartNode(e.target.value); handleClear(); }}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">选择起始节点...</option>
            {sortedNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} ({n.type === 'layer' ? '层' : n.type === 'target' ? '标的' : '概念'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            终点
          </label>
          <select
            value={endNode}
            onChange={(e) => { setEndNode(e.target.value); handleClear(); }}
            className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">选择目标节点...</option>
            {sortedNodes
              .filter((n) => n.id !== startNode)
              .map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label} ({n.type === 'layer' ? '层' : n.type === 'target' ? '标的' : '概念'})
                </option>
              ))}
          </select>
        </div>

        <Button
          size="sm"
          className="w-full h-8 text-xs"
          onClick={() => void handleFind()}
          disabled={!startNode || !endNode || startNode === endNode || loading}
        >
          <Route className="size-3 mr-1" />
          {loading ? '查询中…' : '查找路径'}
        </Button>
        {error && (
          <p className="text-[10px] text-destructive">{error}</p>
        )}
      </div>

      {/* Results */}
      {paths !== null && (
        <div className="border-t border-border p-3">
          {paths.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              未找到连接路径
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  找到 {paths.length} 条路径
                </span>
                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5" onClick={handleClear}>
                  清除
                </Button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {paths.map((path, i) => (
                  <button
                    key={i}
                    className={`w-full text-left rounded-md px-2 py-1.5 text-xs transition-colors ${
                      activePath === i
                        ? 'bg-blue-500/10 ring-1 ring-blue-500/30'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleSelectPath(i)}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      {path.map((nodeId, j) => {
                        const node = nodeMap.get(nodeId);
                        return (
                          <span key={nodeId} className="flex items-center gap-1">
                            {j > 0 && <ArrowRight className="size-2.5 text-muted-foreground shrink-0" />}
                            <Badge
                              variant={activePath === i ? 'default' : 'secondary'}
                              className="text-[9px] h-4 px-1"
                            >
                              {node?.label || nodeId}
                            </Badge>
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-[9px] text-muted-foreground mt-0.5 block">
                      经过 {path.length} 个节点
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
