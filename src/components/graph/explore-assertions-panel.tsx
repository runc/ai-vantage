'use client';

import { useEffect, useState } from 'react';
import type { AssertionDto } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchAssertionsForEntities } from '@/lib/explore-client';

const STATUS_LABELS: Record<string, string> = {
  active: '已生效',
  candidate: '待审核',
  verified: '已核实',
  rejected: '已拒绝',
};

interface ExploreAssertionsPanelProps {
  entityIds: string[];
  useApi: boolean;
}

export function ExploreAssertionsPanel({ entityIds, useApi }: ExploreAssertionsPanelProps) {
  const [assertions, setAssertions] = useState<AssertionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!useApi || entityIds.length === 0) {
      setAssertions([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchAssertionsForEntities(entityIds)
      .then(setAssertions)
      .catch(() => setError('无法加载投资判断（需 API 模式）'))
      .finally(() => setLoading(false));
  }, [entityIds.join(','), useApi]);

  if (!useApi) {
    return (
      <p className="p-4 text-xs text-muted-foreground">
        投资判断需连接图谱 API（开发环境请使用 pnpm dev:stack）。
      </p>
    );
  }

  if (loading) {
    return <p className="p-4 text-xs text-muted-foreground">加载判断中…</p>;
  }

  if (error) {
    return <p className="p-4 text-xs text-destructive">{error}</p>;
  }

  if (assertions.length === 0) {
    return (
      <p className="p-4 text-xs text-muted-foreground">
        范围内暂无已录入判断。可在「入库」生成候选后于「审核」通过。
      </p>
    );
  }

  return (
    <ScrollArea className="h-full">
      <ul className="space-y-3 p-4">
        {assertions.map((a) => (
          <li key={a.id} className="rounded-md border border-border p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {STATUS_LABELS[a.status] ?? a.status}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {(a.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs leading-relaxed">{a.claimText}</p>
            <p className="text-[10px] text-muted-foreground">
              {a.subjectName ?? a.subjectEntityId}
              {a.objectName || a.objectEntityId
                ? ` · ${a.objectName ?? a.objectEntityId}`
                : ''}
            </p>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
