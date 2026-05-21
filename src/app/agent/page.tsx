'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  agentQueryGraph,
  agentGenerateBrief,
  fetchResearchApiHealth,
} from '@/lib/research-client';

const PRESETS = [
  { label: '英伟达上下游', query: '英伟达 上下游' },
  { label: 'AI产业链全景', query: 'AI产业链' },
  { label: '台积电供应链', query: '台积电 供应链' },
];

export default function AgentPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  async function checkApi() {
    const ok = await fetchResearchApiHealth();
    setApiOk(ok);
    return ok;
  }

  async function runExplore() {
    setLoading(true);
    setResult(null);
    try {
      const ok = apiOk ?? (await checkApi());
      if (!ok) {
        setResult('API 未连接。请运行 pnpm dev:stack 并确保数据库已 seed。');
        return;
      }
      const { explore } = await agentQueryGraph(query.trim() || '英伟达');
      const lines = [
        `解析：${explore.parse.mode} · ${explore.parse.summary}`,
        `节点 ${explore.nodeIds.length} 个`,
        '',
        ...explore.nodeIds.slice(0, 12).map((id) => `- ${id}`),
      ];
      if (explore.paths?.length) {
        lines.push('', '路径示例：', explore.paths[0]?.join(' → ') ?? '');
      }
      setResult(lines.join('\n'));
    } catch (e) {
      setResult(e instanceof Error ? e.message : '查询失败');
    } finally {
      setLoading(false);
    }
  }

  async function runBrief() {
    setLoading(true);
    try {
      const ok = apiOk ?? (await checkApi());
      if (!ok) {
        setResult('需要 API 模式生成简报。');
        return;
      }
      const { markdown } = await agentGenerateBrief('domain', 'ai-industry');
      setResult(markdown);
    } catch (e) {
      setResult(e instanceof Error ? e.message : '简报失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Agent 研究助手</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          调用 <code className="text-xs">/agent-tools</code> 查询图谱与生成领域简报（M5 MVP）。
        </p>
        <Link href="/graph" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          完整图谱探索 →
        </Link>
      </div>

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">自然语言查图谱</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full min-h-[80px] rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="例如：英伟达 上下游、AI产业链"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.label} size="sm" variant="outline" onClick={() => setQuery(p.query)}>
                {p.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button disabled={loading} onClick={() => void runExplore()}>
              查询图谱
            </Button>
            <Button disabled={loading} variant="secondary" onClick={() => void runBrief()}>
              领域简报
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <pre className="rounded-lg border bg-muted/30 p-4 text-xs whitespace-pre-wrap overflow-auto max-h-[480px]">
          {result}
        </pre>
      )}
    </main>
  );
}
