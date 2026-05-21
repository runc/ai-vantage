'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Node } from '@xyflow/react';
import type { AssertionDto } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CERTAINTY_COLORS } from '@/lib/graph-constants';
import { fetchEntityAssertions } from '@/lib/admin-api-client';

interface DetailPanelProps {
  node: Node | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  layer: '投资层',
  target: '标的公司',
  concept: '概念',
};

const CERTAINTY_LABELS: Record<string, string> = {
  highest: '最高确定性',
  high: '高确定性',
  medium: '中等确定性',
  low: '低确定性',
  lowest: '最低确定性',
};

function EntityAssertions({ entityId }: { entityId: string }) {
  const [assertions, setAssertions] = useState<AssertionDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchEntityAssertions(entityId, 'active')
      .then((list) => {
        if (!cancelled) setAssertions(list);
      })
      .catch(() => {
        if (!cancelled) setAssertions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [entityId]);

  if (assertions.length === 0) return null;

  return (
    <>
      <Separator />
      <div>
        <span className="text-xs text-muted-foreground block mb-1.5">投资判断</span>
        <ul className="space-y-2">
          {assertions.map((a) => (
            <li key={a.id} className="text-xs leading-relaxed text-foreground">
              {a.claimText}
              <span className="ml-1 text-muted-foreground">
                ({(a.confidence * 100).toFixed(0)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) return null;

  const data = node.data as Record<string, unknown>;
  const nodeType = (data.nodeType as string) || node.type || 'unknown';
  const label = data.label as string;

  const getLink = () => {
    if (nodeType === 'layer') return `/explore/layer/${node.id}`;
    if (nodeType === 'target') return `/explore/target/${node.id}`;
    return null;
  };

  const link = getLink();

  return (
    <div className="absolute right-0 top-0 z-50 h-full w-80 border-l border-border bg-background shadow-xl animate-in slide-in-from-right-full duration-300">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase">
            {TYPE_LABELS[nodeType] || nodeType}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-52px)]">
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{label}</h3>
            {nodeType === 'target' && !!data.titleZh && (data.titleZh as string) !== label && (
              <p className="text-sm text-muted-foreground">{String(data.titleZh)}</p>
            )}
          </div>

          <Separator />

          {/* Layer-specific details */}
          {nodeType === 'layer' && (
            <div className="space-y-3">
              {!!data.certainty && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">确定性:</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${CERTAINTY_COLORS[data.certainty as string]}20`,
                      color: CERTAINTY_COLORS[data.certainty as string],
                    }}
                  >
                    {CERTAINTY_LABELS[data.certainty as string] || (data.certainty as string)}
                  </span>
                </div>
              )}
              {data.rank != null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">排名:</span>
                  <span className="text-xs font-medium">#{String(data.rank)}</span>
                </div>
              )}
              {!!data.summary && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">摘要:</span>
                  <p className="text-sm text-foreground leading-relaxed">{String(data.summary)}</p>
                </div>
              )}
              {!!data.representatives && (data.representatives as string[]).length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">代表公司:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.representatives as string[]).map((rep) => (
                      <Badge key={rep} variant="outline" className="text-[10px]">
                        {rep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target-specific details */}
          {nodeType === 'target' && (
            <div className="space-y-3">
              {!!data.layer && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">所属层:</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {String(data.layer)}
                  </Badge>
                </div>
              )}
              {!!data.moat && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">护城河:</span>
                  <p className="text-sm text-foreground leading-relaxed">{String(data.moat)}</p>
                </div>
              )}
              {!!data.risk && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">风险:</span>
                  <p className="text-sm text-orange-600 dark:text-orange-400 leading-relaxed">
                    {String(data.risk)}
                  </p>
                </div>
              )}
              {!!data.marketPosition && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">市场地位:</span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {String(data.marketPosition)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Concept-specific details */}
          {nodeType === 'concept' && (
            <div className="space-y-3">
              {!!data.relatedLayers && (data.relatedLayers as string[]).length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">相关层:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.relatedLayers as string[]).map((l) => (
                      <Badge key={l} variant="outline" className="text-[10px]">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {!!data.relatedTargets && (data.relatedTargets as string[]).length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">相关标的:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.relatedTargets as string[]).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(nodeType === 'target' || nodeType === 'layer') && (
            <EntityAssertions entityId={node.id} />
          )}

          {/* View full page link */}
          {link && (
            <>
              <Separator />
              <Link
                href={link}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                查看详情页
              </Link>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
