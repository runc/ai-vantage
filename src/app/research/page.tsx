'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ResearchIndexResponse } from '@ai-vantage/contracts';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchResearchIndex, fetchResearchApiHealth } from '@/lib/research-client';
import { buildStaticResearchIndex } from '@/lib/research-static';

export default function ResearchHubPage() {
  const [index, setIndex] = useState<ResearchIndexResponse | null>(null);
  const [apiMode, setApiMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const ok = await fetchResearchApiHealth();
    setApiMode(ok);
    if (ok) {
      try {
        setIndex(await fetchResearchIndex());
        return;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'API 加载失败');
      }
    }
    setIndex(buildStaticResearchIndex());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!index) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-muted-foreground">加载研究工作台…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight">投资研究工作台</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          领域、主题、标的与事件的结构化视图；数据来自知识图谱与已审核判断。
        </p>
        <div className="mt-2 flex gap-2">
          <Badge variant={apiMode ? 'default' : 'secondary'}>
            {apiMode ? 'API 模式' : '静态模式'}
          </Badge>
          <Link href="/agent" className="text-xs text-blue-600 dark:text-blue-400 hover:underline self-center">
            打开 Agent 研究助手 →
          </Link>
        </div>
        {error && (
          <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">{error}（已回退静态）</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="领域">
          {index.domains.map((d) => (
            <Item key={d.id} href={`/research/domains/${d.slug}`} label={d.name} sub={d.slug} />
          ))}
        </Section>
        <Section title="主题">
          {index.themes.slice(0, 12).map((t) => (
            <Item key={t.id} href={`/research/themes/${t.slug}`} label={t.name} />
          ))}
          {index.themes.length > 12 && (
            <p className="text-xs text-muted-foreground px-1">+{index.themes.length - 12} 更多</p>
          )}
        </Section>
        <Section title="标的">
          {index.instruments.slice(0, 10).map((i) => (
            <Item key={i.id} href={`/research/instruments/${i.slug}`} label={i.name} />
          ))}
        </Section>
        <Section title="事件">
          {index.events.length === 0 ? (
            <p className="text-sm text-muted-foreground px-1">
              暂无事件实体。运行 <code className="text-xs">pnpm db:seed:m5-demo</code> 后刷新。
            </p>
          ) : (
            index.events.map((e) => (
              <Item key={e.id} href={`/research/events/${e.id}`} label={e.name} />
            ))
          )}
        </Section>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">相关入口</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 text-sm">
          <Link href="/graph" className="text-blue-600 dark:text-blue-400 hover:underline">
            知识图谱（NL 探索）
          </Link>
          <Link href="/research/documents" className="text-blue-600 dark:text-blue-400 hover:underline">
            文档入库
          </Link>
          <Link href="/review/assertions" className="text-blue-600 dark:text-blue-400 hover:underline">
            审核队列
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  hrefPrefix?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">{children}</CardContent>
    </Card>
  );
}

function Item({ href, label, sub }: { href: string; label: string; sub?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
    >
      <span>{label}</span>
      {sub && <span className="text-xs text-muted-foreground font-mono">{sub}</span>}
    </Link>
  );
}
