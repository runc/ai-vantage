'use client';

import { use, useCallback, useEffect, useState } from 'react';
import type { InstrumentViewResponse } from '@ai-vantage/contracts';
import Link from 'next/link';
import { fetchInstrumentView, fetchResearchApiHealth } from '@/lib/research-client';
import { buildStaticInstrumentView } from '@/lib/research-static';
import { EntityRefList } from '@/components/research/entity-ref-list';
import { AssertionList } from '@/components/research/assertion-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function InstrumentResearchPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const [view, setView] = useState<InstrumentViewResponse | null>(null);
  const [apiMode, setApiMode] = useState(false);

  const load = useCallback(async () => {
    const ok = await fetchResearchApiHealth();
    setApiMode(ok);
    if (ok) {
      try {
        setView(await fetchInstrumentView(symbol));
        return;
      } catch {
        /* fallback */
      }
    }
    setView(buildStaticInstrumentView(symbol));
  }, [symbol]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!view) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">未找到标的「{symbol}」</p>
        <Link href="/research" className="text-sm text-blue-600 mt-4 inline-block">
          ← 返回
        </Link>
      </main>
    );
  }

  const titleZh = view.entity.properties?.titleZh as string | undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/research">研究工作台</Link>
        <span className="mx-2">/</span>
        <span>标的</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold">
          {view.entity.name}
          {titleZh && (
            <span className="text-muted-foreground font-normal text-xl ml-2">{titleZh}</span>
          )}
        </h1>
        {view.layer && (
          <p className="mt-2 text-sm text-muted-foreground">
            所属层级：
            <Link
              href={`/explore/layer/${view.layer.slug}`}
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              {view.layer.name}
            </Link>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={apiMode ? 'default' : 'secondary'}>{apiMode ? 'API' : '静态'}</Badge>
          <Link href={`/explore/target/${symbol}`}>
            <Button size="sm" variant="outline">
              MDX 深度阅读
            </Button>
          </Link>
          <Link href={`/graph?explore=${encodeURIComponent(view.entity.name + ' 上下游')}`}>
            <Button size="sm" variant="secondary">
              图谱探索
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <section>
          <h2 className="text-sm font-semibold mb-2">上游</h2>
          <EntityRefList items={view.upstream} emptyLabel="—" />
        </section>
        <section>
          <h2 className="text-sm font-semibold mb-2">下游</h2>
          <EntityRefList items={view.downstream} emptyLabel="—" />
        </section>
        <section>
          <h2 className="text-sm font-semibold mb-2">竞争</h2>
          <EntityRefList items={view.competitors} emptyLabel="—" />
        </section>
      </div>

      {view.events.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">相关事件</h2>
          <EntityRefList items={view.events} />
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">投资判断</h2>
        <AssertionList assertions={view.assertions} />
      </section>
    </main>
  );
}
