'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AssertionDto, EvidenceDto } from '@ai-vantage/contracts';
import { AssertionReviewCard } from '@/components/review/assertion-review-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  deprecateAssertion,
  fetchAssertions,
  fetchEvidencesByIds,
  rejectAssertion,
  verifyAssertion,
} from '@/lib/admin-api-client';

const FILTERS = [
  { value: 'candidate', label: '待审核' },
  { value: 'verified', label: '已核实' },
  { value: 'active', label: '已生效' },
  { value: 'rejected', label: '已拒绝' },
] as const;

export default function AssertionReviewPage() {
  const [status, setStatus] = useState<string>('candidate');
  const [assertions, setAssertions] = useState<AssertionDto[]>([]);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, EvidenceDto>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchAssertions({ status });
      setAssertions(list);
      const evidenceIds = [...new Set(list.flatMap((a) => a.evidenceIds))];
      const evidences = await fetchEvidencesByIds(evidenceIds);
      setEvidenceMap(Object.fromEntries(evidences.map((e) => [e.id, e])));
      if (list.length > 0 && !list.some((a) => a.id === selectedId)) {
        setSelectedId(list[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = assertions.find((a) => a.id === selectedId) ?? null;

  async function runAction(action: () => Promise<unknown>) {
    setLoading(true);
    try {
      await action();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">判断审核</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          审核投资判断（Assertion）与关联证据。M4 将支持文档自动入库。
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={status === f.value ? 'default' : 'outline'}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => void load()}>
          刷新
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          <span className="block text-xs mt-1 text-muted-foreground">
            请确认 API 已启动（pnpm dev:stack）且已执行 pnpm db:seed:m3-demo
          </span>
        </p>
      )}

      {assertions.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-sm text-muted-foreground">
          当前筛选下暂无判断。可运行 <code className="text-xs">pnpm db:seed:m3-demo</code>{' '}
          加载演示数据。
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <ScrollArea className="h-[calc(100vh-220px)] pr-4">
            <div className="space-y-3">
              {assertions.map((a) => (
                <AssertionReviewCard
                  key={a.id}
                  assertion={a}
                  evidences={a.evidenceIds
                    .map((id) => evidenceMap[id])
                    .filter(Boolean)}
                  selected={a.id === selectedId}
                  loading={loading}
                  onSelect={() => setSelectedId(a.id)}
                  onVerify={() => runAction(() => verifyAssertion(a.id))}
                  onReject={() => runAction(() => rejectAssertion(a.id, '审核拒绝'))}
                  onDeprecate={() =>
                    runAction(() => deprecateAssertion(a.id, '标记废弃'))
                  }
                />
              ))}
            </div>
          </ScrollArea>

          <aside className="rounded-lg border bg-card p-4 h-fit sticky top-20">
            <h2 className="text-sm font-semibold mb-2">详情</h2>
            {selected ? (
              <div className="space-y-3 text-sm">
                <Badge variant="outline">{selected.status}</Badge>
                <p className="leading-relaxed">{selected.claimText}</p>
                <Separator />
                <dl className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    <dt className="inline">主体 </dt>
                    <dd className="inline text-foreground">
                      {selected.subjectName ?? selected.subjectEntityId}
                    </dd>
                  </div>
                  {(selected.objectName || selected.objectEntityId) && (
                    <div>
                      <dt className="inline">客体 </dt>
                      <dd className="inline text-foreground">
                        {selected.objectName ?? selected.objectEntityId}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline">谓词 </dt>
                    <dd className="inline text-foreground">{selected.predicate}</dd>
                  </div>
                </dl>
                {selected.evidenceIds.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-xs font-medium">证据</p>
                    {selected.evidenceIds.map((id) => {
                      const ev = evidenceMap[id];
                      if (!ev) return null;
                      return (
                        <blockquote
                          key={id}
                          className="border-l-2 pl-2 text-xs text-muted-foreground"
                        >
                          {ev.sourceTitle}
                          {ev.evidenceSpan && (
                            <p className="mt-1 text-foreground">{ev.evidenceSpan}</p>
                          )}
                        </blockquote>
                      );
                    })}
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">选择左侧卡片查看详情</p>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
