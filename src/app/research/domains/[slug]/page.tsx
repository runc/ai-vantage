'use client';

import { use, useCallback, useEffect, useState } from 'react';
import type { DomainViewResponse } from '@ai-vantage/contracts';
import Link from 'next/link';
import { fetchDomainView, fetchResearchApiHealth } from '@/lib/research-client';
import { buildStaticDomainView } from '@/lib/research-static';
import { EntityRefList } from '@/components/research/entity-ref-list';
import { AssertionList } from '@/components/research/assertion-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { agentGenerateBrief } from '@/lib/research-client';

export default function DomainResearchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [view, setView] = useState<DomainViewResponse | null>(null);
  const [brief, setBrief] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState(false);

  const load = useCallback(async () => {
    const ok = await fetchResearchApiHealth();
    setApiMode(ok);
    if (ok) {
      try {
        setView(await fetchDomainView(slug));
        return;
      } catch {
        /* fallback */
      }
    }
    setView(buildStaticDomainView(slug));
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!view) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-muted-foreground">未找到领域「{slug}」</p>
        <Link href="/research" className="text-sm text-blue-600 mt-4 inline-block">
          ← 返回研究工作台
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav className="text-sm text-muted-foreground mb-4">
        <Link href="/research" className="hover:text-foreground">
          研究工作台
        </Link>
        <span className="mx-2">/</span>
        <span>领域</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold">{view.entity.name}</h1>
        {view.summary && <p className="mt-2 text-muted-foreground">{view.summary}</p>}
        <div className="mt-3 flex gap-2">
          <Badge variant={apiMode ? 'default' : 'secondary'}>{apiMode ? 'API' : '静态'}</Badge>
          {apiMode && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                agentGenerateBrief('domain', slug).then((r) => setBrief(r.markdown))
              }
            >
              生成简报
            </Button>
          )}
          <Link href={`/graph?explore=${encodeURIComponent('AI产业链')}`}>
            <Button size="sm" variant="secondary">
              在图谱中探索
            </Button>
          </Link>
        </div>
      </header>

      {brief && (
        <pre className="mb-6 rounded-lg border bg-muted/30 p-4 text-xs whitespace-pre-wrap overflow-auto max-h-64">
          {brief}
        </pre>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">产业链层级</h2>
        <EntityRefList items={view.layers} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">核心标的</h2>
        <EntityRefList items={view.companies} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">投资主题</h2>
        <EntityRefList items={view.themes} />
      </section>

      {view.events.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">相关事件</h2>
          <EntityRefList items={view.events} />
        </section>
      )}

      {view.risks && view.risks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">关键风险</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {view.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">关键判断</h2>
        <AssertionList assertions={view.assertions} />
      </section>
    </main>
  );
}
