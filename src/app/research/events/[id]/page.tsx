'use client';

import { use, useCallback, useEffect, useState } from 'react';
import type { EventViewResponse } from '@ai-vantage/contracts';
import Link from 'next/link';
import { fetchEventView, fetchResearchApiHealth } from '@/lib/research-client';
import { EntityRefList } from '@/components/research/entity-ref-list';
import { AssertionList } from '@/components/research/assertion-list';
import { Badge } from '@/components/ui/badge';

export default function EventResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [view, setView] = useState<EventViewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const ok = await fetchResearchApiHealth();
    setApiMode(ok);
    if (!ok) {
      setError('事件视图需要 API 与 M5 演示数据（pnpm db:seed:m5-demo）');
      setView(null);
      return;
    }
    try {
      setView(await fetchEventView(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
      setView(null);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error || !view) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">{error ?? `未找到事件「${id}」`}</p>
        <Link href="/research" className="text-sm text-blue-600 mt-4 inline-block">
          ← 返回
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/research">研究工作台</Link>
        <span className="mx-2">/</span>
        <span>事件</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold">{view.entity.name}</h1>
        {view.summary && <p className="mt-2 text-muted-foreground">{view.summary}</p>}
        <Badge className="mt-2">{apiMode ? 'API' : '静态'}</Badge>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">影响范围</h2>
        {view.affectedDomains.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">领域</p>
            <EntityRefList items={view.affectedDomains} />
          </div>
        )}
        {view.affectedCompanies.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">公司</p>
            <EntityRefList items={view.affectedCompanies} />
          </div>
        )}
        {view.affectedThemes.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">主题</p>
            <EntityRefList items={view.affectedThemes} />
          </div>
        )}
      </section>

      {view.impactPaths.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">影响路径</h2>
          <ul className="space-y-2 text-sm">
            {view.impactPaths.map((p, i) => (
              <li key={i} className="rounded-md border px-3 py-2 font-mono text-xs">
                {p.labels.join(' → ')}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">相关判断</h2>
        <AssertionList assertions={view.assertions} />
      </section>
    </main>
  );
}
