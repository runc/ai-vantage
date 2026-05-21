'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';

import { LayerNode } from './layer-node';
import { TargetNode } from './target-node';
import { ConceptNode } from './concept-node';
import { DetailPanel } from './detail-panel';
import { GraphFiltersPanel, DEFAULT_FILTERS, type GraphFilters } from './graph-filters';
import { GraphToolbar, GraphToolbar3D, type GraphViewMode } from './graph-toolbar';
import { PathFinder } from './path-finder';
import { Graph3D } from './graph-3d';
import { CERTAINTY_COLORS } from '@/lib/graph-constants';
import { findAllPaths, getNHopNeighbors } from '@/lib/graph-algorithms';
import { fetchGraphPathClient } from '@/lib/api-client';
import {
  runLocalExplore,
  fetchGraphExploreClient,
  type LocalExploreResult,
} from '@/lib/explore-client';
import { GraphExploreBar, type ExploreLayoutMode } from './graph-explore-bar';
import {
  ExploreInsightsPanel,
  ExploreListLayout,
  type ExploreInsightsTab,
} from './explore-insights-panel';
import { computeElkLayout } from '@/lib/graph-layout';
import type { GraphNode as RawGraphNode, GraphEdge as RawGraphEdge } from '@/lib/types';

// IMPORTANT: Define nodeTypes OUTSIDE the component to prevent re-renders
const nodeTypes = {
  layer: LayerNode,
  target: TargetNode,
  concept: ConceptNode,
};

interface KnowledgeGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  rawGraphNodes: RawGraphNode[];
  rawGraphEdges: RawGraphEdge[];
  defaultSelectedNodeId?: string | null;
  /** M2: use Hono /graph/path when graph was loaded from API */
  useApiPaths?: boolean;
}

function KnowledgeGraphInner({
  initialNodes,
  initialEdges,
  rawGraphNodes,
  rawGraphEdges,
  defaultSelectedNodeId,
  useApiPaths = false,
}: KnowledgeGraphProps) {
  const { resolvedTheme } = useTheme();
  const { fitView, setCenter } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(() => {
    if (!defaultSelectedNodeId) return null;
    return initialNodes.find((node) => node.id === defaultSelectedNodeId) ?? null;
  });
  const [filters, setFilters] = useState<GraphFilters>(DEFAULT_FILTERS);

  // View mode: 2D or 3D
  const [viewMode, setViewMode] = useState<GraphViewMode>('2d');

  // Focus mode
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [focusHops, setFocusHops] = useState(1);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Path finder
  const [pathFinderOpen, setPathFinderOpen] = useState(false);
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null);

  // NL explore
  const [exploreScope, setExploreScope] = useState<LocalExploreResult | null>(null);
  const [exploreSummary, setExploreSummary] = useState<string | null>(null);
  const [exploreParser, setExploreParser] = useState<'rule' | 'llm' | null>(null);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreLayout, setExploreLayout] = useState<ExploreLayoutMode>('graph');
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsTab, setInsightsTab] = useState<ExploreInsightsTab>('list');
  const [useLlm, setUseLlm] = useState(false);

  // Re-layout with ELK client-side after initial grid layout from server
  useEffect(() => {
    let cancelled = false;
    computeElkLayout(rawGraphNodes, rawGraphEdges).then((positions) => {
      if (cancelled) return;
      setNodes((nds) =>
        nds.map((n) => {
          const pos = positions.get(n.id);
          return pos ? { ...n, position: pos } : n;
        })
      );
    });
    return () => { cancelled = true; };
  }, [rawGraphNodes, rawGraphEdges, setNodes]);

  // Compute focused neighbors
  const focusData = useMemo(() => {
    if (!focusNodeId) return null;
    return getNHopNeighbors(rawGraphEdges, focusNodeId, focusHops);
  }, [focusNodeId, focusHops, rawGraphEdges]);


  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rawGraphNodes
      .filter((n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q))
      .slice(0, 10)
      .map((n) => ({ id: n.id, label: n.label, type: n.type }));
  }, [searchQuery, rawGraphNodes]);

  // Flat node list for path finder
  const nodeList = useMemo(
    () => rawGraphNodes.map((n) => ({ id: n.id, label: n.label, type: n.type })),
    [rawGraphNodes]
  );

  // Apply filters + focus + path highlight to nodes
  const filteredNodes = useMemo(() => {
    return nodes.map((node) => {
      const data = node.data as Record<string, unknown>;
      const nodeType = (data.nodeType as string) || node.type || 'unknown';

      let hidden = false;
      let dimmed = false;

      // Filter by node type
      if (nodeType === 'layer' && !filters.nodeTypes.layer) hidden = true;
      if (nodeType === 'target' && !filters.nodeTypes.target) hidden = true;
      if (nodeType === 'concept' && !filters.nodeTypes.concept) hidden = true;

      // Filter by certainty (only applies to layer nodes)
      if (nodeType === 'layer' && data.certainty) {
        const certainty = data.certainty as keyof GraphFilters['certainty'];
        if (!filters.certainty[certainty]) hidden = true;
      }

      // Focus mode: dim nodes outside the N-hop neighborhood
      if (focusData && !hidden) {
        if (!focusData.nodes.has(node.id)) {
          dimmed = true;
        }
      }

      if (exploreScope && !hidden) {
        if (!exploreScope.nodeIds.has(node.id)) {
          dimmed = true;
        }
      }

      // Path highlight: dim nodes not in path
      if (highlightedPath && !hidden) {
        if (!highlightedPath.includes(node.id)) {
          dimmed = true;
        }
      }

      return {
        ...node,
        hidden,
        style: {
          ...node.style,
          opacity: dimmed ? 0.15 : 1,
          transition: 'opacity 0.3s ease',
        },
      };
    });
  }, [nodes, filters, focusData, highlightedPath, exploreScope]);

  const filteredEdges = useMemo(() => {
    const hiddenNodeIds = new Set(
      filteredNodes.filter((n) => n.hidden).map((n) => n.id)
    );

    return edges.map((edge) => {
      const edgeData = edge.data as Record<string, unknown> | undefined;
      const edgeType = (edgeData?.edgeType as keyof GraphFilters['edgeTypes']) || 'relates-to';

      let hidden = false;
      let dimmed = false;

      // Hide edges connected to hidden nodes
      if (hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target)) {
        hidden = true;
      }

      // Filter by edge type
      if (!filters.edgeTypes[edgeType]) hidden = true;

      // Focus mode: dim edges outside neighborhood
      if (focusData && !hidden) {
        if (!focusData.edges.has(edge.id)) {
          dimmed = true;
        }
      }

      if (exploreScope && !hidden) {
        if (!exploreScope.nodeIds.has(edge.source) || !exploreScope.nodeIds.has(edge.target)) {
          dimmed = true;
        }
      }

      // Path highlight
      if (highlightedPath && !hidden) {
        const srcInPath = highlightedPath.includes(edge.source);
        const tgtInPath = highlightedPath.includes(edge.target);
        const srcIdx = highlightedPath.indexOf(edge.source);
        const tgtIdx = highlightedPath.indexOf(edge.target);
        const isAdjacent = srcInPath && tgtInPath && Math.abs(srcIdx - tgtIdx) === 1;
        if (!isAdjacent) {
          dimmed = true;
        }
      }

      return {
        ...edge,
        hidden,
        style: {
          ...edge.style,
          opacity: dimmed ? 0.08 : undefined,
          transition: 'opacity 0.3s ease',
        },
      };
    });
  }, [edges, filteredNodes, filters, focusData, highlightedPath, exploreScope]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
    setFocusNodeId(node.id);
    setHighlightedPath(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setFocusNodeId(null);
    setHighlightedPath(null);
  }, []);

  const handleSearchSelect = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setCenter(node.position.x + 100, node.position.y + 40, { zoom: 1.2, duration: 800 });
        setSelectedNode(node);
        setFocusNodeId(nodeId);
      }
    },
    [nodes, setCenter]
  );

  const handleFindPath = useCallback(
    async (startId: string, endId: string): Promise<string[][] | null> => {
      if (useApiPaths) {
        try {
          return await fetchGraphPathClient(startId, endId, 5);
        } catch {
          return findAllPaths(rawGraphEdges, startId, endId, 5);
        }
      }
      return findAllPaths(rawGraphEdges, startId, endId, 5);
    },
    [rawGraphEdges, useApiPaths]
  );

  const handleExplore = useCallback(
    async (q: string) => {
      setExploreLoading(true);
      setExploreSummary(null);
      try {
        let result: LocalExploreResult;
        if (useApiPaths) {
          const res = await fetchGraphExploreClient(q, { useLlm });
          result = {
            parse: res.parse,
            parser: res.parser,
            nodeIds: new Set(res.nodeIds),
            relationIds: new Set(res.graph.relations.map((r) => r.id)),
            paths: res.paths,
          };
        } else {
          result = runLocalExplore(q, rawGraphNodes, rawGraphEdges);
        }
        setExploreScope(result);
        setExploreSummary(result.parse.summary);
        setExploreParser(result.parser);
        setInsightsOpen(true);
        if (result.parse.focus?.id) {
          setFocusNodeId(result.parse.focus.id);
          const node = nodes.find((n) => n.id === result.parse.focus!.id);
          if (node) {
            setSelectedNode(node);
            setCenter(node.position.x + 100, node.position.y + 40, {
              zoom: 1.1,
              duration: 600,
            });
          }
        }
        if (result.paths?.[0]?.length) {
          setHighlightedPath(result.paths[0]);
        } else {
          setHighlightedPath(null);
        }
      } catch {
        setExploreSummary('探索失败，请检查 API 是否可用');
        setExploreScope(null);
        setExploreParser(null);
        setInsightsOpen(false);
      } finally {
        setExploreLoading(false);
      }
    },
    [useApiPaths, useLlm, rawGraphNodes, rawGraphEdges, nodes, setCenter],
  );

  const clearExplore = useCallback(() => {
    setExploreScope(null);
    setExploreSummary(null);
    setExploreParser(null);
    setInsightsOpen(false);
    setHighlightedPath(null);
  }, []);

  const handleExploreSelectNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNode(node);
        setFocusNodeId(nodeId);
        if (viewMode === '2d') {
          setCenter(node.position.x + 100, node.position.y + 40, {
            zoom: 1.1,
            duration: 500,
          });
        }
      }
    },
    [nodes, setCenter, viewMode],
  );

  const handle3DNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) setSelectedNode(node);
    },
    [nodes]
  );

  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light';

  const showInsights = insightsOpen && exploreScope && viewMode === '2d';
  const showListOnly = exploreLayout === 'list' && exploreScope && viewMode === '2d';

  return (
    <div className="relative flex h-full min-h-[72vh] w-full overflow-hidden">
      <div
        className={
          showInsights && !showListOnly
            ? 'flex min-w-0 flex-1 flex-col'
            : 'flex h-full w-full flex-col'
        }
      >
        {viewMode === '2d' && (
          <div className="z-20 shrink-0 border-b border-border bg-background/80 px-2 py-2 backdrop-blur-sm">
            <GraphExploreBar
              onExplore={handleExplore}
              onClear={clearExplore}
              summary={exploreSummary}
              parser={exploreParser}
              loading={exploreLoading}
              layoutMode={exploreLayout}
              onLayoutModeChange={setExploreLayout}
              useLlm={useLlm}
              onUseLlmChange={setUseLlm}
              canUseLlm={useApiPaths}
            />
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          {showListOnly && exploreScope ? (
            <ExploreListLayout>
              <ExploreInsightsPanel
                tab={insightsTab}
                onTabChange={setInsightsTab}
                parse={exploreScope.parse}
                parser={exploreScope.parser}
                nodeIds={exploreScope.nodeIds}
                paths={exploreScope.paths}
                nodes={rawGraphNodes}
                edges={rawGraphEdges}
                onSelectNode={handleExploreSelectNode}
                selectedNodeId={selectedNode?.id ?? null}
                useApi={useApiPaths}
                onClose={clearExplore}
              />
            </ExploreListLayout>
          ) : viewMode === '2d' ? (
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          colorMode={colorMode}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls
            className="!border-border !bg-background/90 !shadow-md [&>button]:!border-border [&>button]:!bg-background [&>button]:!text-foreground"
            showInteractive={false}
          />
          <MiniMap
            className="!border-border !bg-background/90 !shadow-md"
            nodeColor={(node) => {
              const data = node.data as Record<string, unknown>;
              if (node.type === 'layer' && data.certainty) {
                return CERTAINTY_COLORS[data.certainty as string] || '#6b7280';
              }
              if (node.type === 'target') return '#60a5fa';
              if (node.type === 'concept') return '#a78bfa';
              return '#6b7280';
            }}
            maskColor={resolvedTheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
            pannable
            zoomable
          />
          <GraphFiltersPanel filters={filters} onChange={setFilters} />
          <GraphToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFitView={() => fitView({ padding: 0.2, duration: 500 })}
            onResetLayout={() => {
              setFocusNodeId(null);
              setHighlightedPath(null);
              clearExplore();
              setFilters(DEFAULT_FILTERS);
              setSelectedNode(null);
              setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchSelect={handleSearchSelect}
            onOpenPathFinder={() => setPathFinderOpen(!pathFinderOpen)}
            focusMode={!!focusNodeId}
            focusHops={focusHops}
            onFocusHopsChange={setFocusHops}
          />
        </ReactFlow>
      ) : (
        <>
          <Graph3D
            graphNodes={rawGraphNodes}
            graphEdges={rawGraphEdges}
            onNodeClick={handle3DNodeClick}
          />
          {/* Toolbar overlay for 3D mode — rendered outside ReactFlow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="pointer-events-auto absolute right-3 top-3">
              <GraphToolbar3D
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onFitView={() => {}}
                onResetLayout={() => {}}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchResults={searchResults}
                onSearchSelect={handleSearchSelect}
                onOpenPathFinder={() => {}}
                focusMode={false}
                focusHops={focusHops}
                onFocusHopsChange={setFocusHops}
              />
            </div>
          </div>
        </>
          )}
        </div>

        {!showListOnly && (
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>

      {showInsights && !showListOnly && exploreScope && (
        <div className="w-96 shrink-0 border-l">
          <ExploreInsightsPanel
            tab={insightsTab}
            onTabChange={setInsightsTab}
            parse={exploreScope.parse}
            parser={exploreScope.parser}
            nodeIds={exploreScope.nodeIds}
            paths={exploreScope.paths}
            nodes={rawGraphNodes}
            edges={rawGraphEdges}
            onSelectNode={handleExploreSelectNode}
            selectedNodeId={selectedNode?.id ?? null}
            useApi={useApiPaths}
            onClose={clearExplore}
          />
        </div>
      )}

      {/* Path finder panel */}
      {pathFinderOpen && viewMode === '2d' && (
        <PathFinder
          nodes={nodeList}
          onFindPath={handleFindPath}
          onHighlightPath={(path) => {
            setHighlightedPath(path);
            setFocusNodeId(null);
          }}
          onClose={() => {
            setPathFinderOpen(false);
            setHighlightedPath(null);
          }}
        />
      )}

    </div>
  );
}

/** Wrapped with ReactFlowProvider so hooks like useReactFlow work */
export function KnowledgeGraph(props: KnowledgeGraphProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner {...props} />
    </ReactFlowProvider>
  );
}
