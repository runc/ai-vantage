'use client';

import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods } from 'react-force-graph-3d';
import { useTheme } from 'next-themes';

// Dynamic import - 3D graph requires WebGL (client-only)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

/* ── Color constants (inline to keep client component self-contained) ── */
const CERTAINTY_COLORS: Record<string, string> = {
  highest: '#22c55e',
  high: '#84cc16',
  medium: '#eab308',
  low: '#f97316',
  lowest: '#ef4444',
};

const EDGE_COLORS: Record<string, string> = {
  'belongs-to': '#6b7280',
  'competes-with': '#ef4444',
  'supplies-to': '#3b82f6',
  threatens: '#f97316',
  'relates-to': '#8b5cf6',
};

const LAYER_CERTAINTY: Record<string, string> = {
  'physical-engineering': 'highest',
  oligopoly: 'high',
  'cloud-platform': 'high',
  'chip-design': 'medium',
  'application-model': 'low',
  'middle-squeeze': 'low',
  'zero-barrier': 'lowest',
};

const NODE_SIZE: Record<string, number> = {
  layer: 12,
  target: 8,
  concept: 5,
};

/* ── Types ── */
interface GraphNodeInput {
  id: string;
  type: 'layer' | 'target' | 'concept';
  label: string;
  data?: Record<string, unknown>;
}

interface GraphEdgeInput {
  source: string;
  target: string;
  type: string;
  label: string;
}

interface Graph3DProps {
  graphNodes: GraphNodeInput[];
  graphEdges: GraphEdgeInput[];
  onNodeClick?: (nodeId: string) => void;
}

/* ── Internal graph data types ── */
interface FGNode {
  id: string;
  name: string;
  type: string;
  color: string;
  size: number;
  x?: number;
  y?: number;
  z?: number;
}

interface FGLink {
  source: string;
  target: string;
  type: string;
  color: string;
  label: string;
}

function getNodeColor(node: GraphNodeInput): string {
  if (node.type === 'layer') {
    const certainty = (node.data?.certainty as string) || 'medium';
    return CERTAINTY_COLORS[certainty] || '#6b7280';
  }
  if (node.type === 'target') {
    const layer = (node.data?.layer as string) || '';
    const certainty = LAYER_CERTAINTY[layer] || 'medium';
    return CERTAINTY_COLORS[certainty] || '#60a5fa';
  }
  return '#a78bfa';
}

export function Graph3D({ graphNodes, graphEdges, onNodeClick }: Graph3DProps) {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mounted, setMounted] = useState(false);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const bgColor = isDark ? '#0a0a0a' : '#f8fafc';
  const dimNodeColor = isDark ? '#333333' : '#d1d5db';
  const dimLinkColor = isDark ? '#1a1a1a' : '#e5e7eb';

  // SSR guard
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Transform data
  const graphData = useMemo(() => {
    const nodes: FGNode[] = graphNodes.map((n) => ({
      id: n.id,
      name: n.label,
      type: n.type,
      color: getNodeColor(n),
      size: NODE_SIZE[n.type] || 6,
    }));

    const nodeSet = new Set(graphNodes.map((n) => n.id));
    const links: FGLink[] = graphEdges
      .filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        type: e.type,
        color: EDGE_COLORS[e.type] || '#6b7280',
        label: e.label,
      }));

    return { nodes, links };
  }, [graphNodes, graphEdges]);

  // Connected nodes for hover highlight
  const connectedMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    graphEdges.forEach((e) => {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    });
    return map;
  }, [graphEdges]);

  const handleNodeClick = useCallback(
    (node: object) => {
      const fgNode = node as FGNode;
      if (onNodeClick) {
        onNodeClick(fgNode.id);
      }
      // Zoom to node
      if (graphRef.current && fgNode.x != null && fgNode.y != null && fgNode.z != null) {
        const distance = 120;
        const distRatio = 1 + distance / Math.hypot(fgNode.x, fgNode.y, fgNode.z || 1);
        graphRef.current.cameraPosition(
          { x: fgNode.x * distRatio, y: fgNode.y * distRatio, z: fgNode.z * distRatio },
          { x: fgNode.x, y: fgNode.y, z: fgNode.z },
          1500
        );
      }
    },
    [onNodeClick]
  );

  const handleNodeHover = useCallback((node: object | null) => {
    const fgNode = node as FGNode | null;
    setHoverNode(fgNode?.id || null);
  }, []);

  if (!mounted) {
    return (
      <div ref={containerRef} className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground animate-pulse">加载 3D 图谱...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <ForceGraph3D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor={bgColor}
        nodeLabel={(node: object) => (node as FGNode).name}
        nodeVal={(node: object) => (node as FGNode).size}
        nodeColor={(node: object) => {
          const fgNode = node as FGNode;
          if (!hoverNode) return fgNode.color;
          if (fgNode.id === hoverNode) return fgNode.color;
          if (connectedMap.get(hoverNode)?.has(fgNode.id)) return fgNode.color;
          return dimNodeColor;
        }}
        nodeOpacity={0.95}
        nodeRelSize={6}
        linkColor={(link: object) => {
          const fgLink = link as FGLink;
          if (!hoverNode) return fgLink.color;
          const src = typeof fgLink.source === 'string' ? fgLink.source : (fgLink.source as FGNode).id;
          const tgt = typeof fgLink.target === 'string' ? fgLink.target : (fgLink.target as FGNode).id;
          if (src === hoverNode || tgt === hoverNode) return fgLink.color;
          return dimLinkColor;
        }}
        linkWidth={1.5}
        linkOpacity={0.6}
        linkDirectionalParticles={(link: object) =>
          (link as FGLink).type === 'supplies-to' ? 3 : 0
        }
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={(link: object) => (link as FGLink).color}
        linkCurvature={(link: object) =>
          (link as FGLink).type === 'competes-with' ? 0.2 : 0
        }
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        warmupTicks={50}
        cooldownTicks={200}
        enableNodeDrag={true}
        enableNavigationControls={true}
      />

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/90 backdrop-blur-sm p-3 text-xs text-muted-foreground space-y-1.5">
        <div className="font-medium text-foreground mb-1">图例</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>最高确定性</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
          <span>高确定性</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>中等确定性</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>低确定性</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>最低确定性</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>概念</span>
          </div>
        </div>
        <div className="border-t border-border pt-1.5 mt-1.5 text-[10px] text-muted-foreground">
          点击节点聚焦 · 拖拽旋转 · 滚轮缩放
        </div>
      </div>
    </div>
  );
}
