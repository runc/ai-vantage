import {
  getReactFlowData,
  getGraphPageMeta,
  getGraphDataSourceLabel,
  shouldUseApiPaths,
} from '@/lib/graph-data';
import { KnowledgeGraph } from '@/components/graph/knowledge-graph';
import { Badge } from '@/components/ui/badge';

export default async function GraphPage() {
  const meta = await getGraphPageMeta();
  const { nodes, edges } = await getReactFlowData();
  const { graphNodes, graphEdges } = meta;
  const defaultSelectedNodeId = graphNodes.find((node) => node.type === 'layer')?.id ?? null;
  const dataSourceLabel = getGraphDataSourceLabel(meta);
  const useApiPaths = shouldUseApiPaths(meta);

  return (
    <div className="mx-auto flex h-[calc(100vh-56px)] w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
      <section className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          知识图谱
        </Badge>
        <h1 className="text-sm font-semibold text-foreground">AI 产业投资知识图谱</h1>
        <span className="hidden text-xs text-muted-foreground sm:block">
          自然语言探索（如「英伟达 上下游」），或点击节点查看详情与路径发现
        </span>
        <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span>节点 <strong className="text-foreground">{graphNodes.length}</strong></span>
          <span>关系 <strong className="text-foreground">{graphEdges.length}</strong></span>
          <span
            className={
              meta.usedFallback
                ? 'text-amber-600 dark:text-amber-400'
                : undefined
            }
          >
            {dataSourceLabel}
          </span>
          <span>2D 图谱</span>
        </div>
      </section>

      <section className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <KnowledgeGraph
          initialNodes={nodes}
          initialEdges={edges}
          rawGraphNodes={graphNodes}
          rawGraphEdges={graphEdges}
          defaultSelectedNodeId={defaultSelectedNodeId}
          useApiPaths={useApiPaths}
        />
      </section>
    </div>
  );
}
