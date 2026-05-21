'use client';

import { use, useCallback, useEffect, useState } from 'react';
import type { ThemeViewResponse } from '@ai-vantage/contracts';
import Link from 'next/link';
import { fetchThemeView, fetchResearchApiHealth } from '@/lib/research-client';
import { buildStaticThemeView } from '@/lib/research-static';
import { EntityRefList } from '@/components/research/entity-ref-list';
import { AssertionList } from '@/components/research/assertion-list';
import { Badge } from '@/components/ui/badge';

export default function ThemeResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [view, setView] = useState<ThemeViewResponse | null>(null);
  const [apiMode, setApiMode] = useState(false);

  const load = useCallback(async () => {
    const ok = await fetchResearchApiHealth();
    setApiMode(ok);
    if (ok) {
      try {
        setView(await fetchThemeView(slug));
        return;
      } catch {
        /* fallback */
      }
    }
    setView(buildStaticThemeView(slug));
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!view) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">未找到主题「{slug}」</p>
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
        <span>主题</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold">{view.entity.name}</h1>
        {view.thesis && <p className="mt-2 text-muted-foreground">{view.thesis}</p>}
        <Badge className="mt-2" variant={apiMode ? 'default' : 'secondary'}>
          {apiMode ? 'API' : '静态'}
        </Badge>
        <div className="mt-3">
          <Link
            href={`/book/${slug}`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            阅读电子书章节 →
          </Link>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">相关标的</h2>
        <EntityRefList items={view.relatedInstruments} />
      </section>

      {(view.beneficiaries.length > 0 || view.hurt.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <section>
            <h2 className="text-lg font-semibold mb-3 text-emerald-600 dark:text-emerald-400">
              受益
            </h2>
            <EntityRefList items={view.beneficiaries} emptyLabel="暂无图谱关系" />
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-3 text-orange-600 dark:text-orange-400">
              受损
            </h2>
            <EntityRefList items={view.hurt} emptyLabel="暂无图谱关系" />
          </section>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">支撑判断</h2>
        <AssertionList assertions={view.supportingAssertions} />
      </section>

      {view.contradictingAssertions.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">待核实 / 反驳</h2>
          <AssertionList assertions={view.contradictingAssertions} />
        </section>
      )}
    </main>
  );
}
