'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DocumentDto, ExtractionJobDto } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  fetchDocuments,
  fetchDocumentExtractions,
  ingestDocument,
  registerDocumentFromMdx,
} from '@/lib/admin-api-client';

const MDX_QUICK_IMPORT = [
  { kind: 'targets' as const, slug: 'openai', label: 'OpenAI' },
  { kind: 'targets' as const, slug: 'amd', label: 'AMD' },
  { kind: 'targets' as const, slug: 'nvidia', label: 'NVIDIA' },
];

export default function ResearchDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [extractions, setExtractions] = useState<ExtractionJobDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setExtractions([]);
      return;
    }
    fetchDocumentExtractions(selectedId)
      .then(setExtractions)
      .catch(() => setExtractions([]));
  }, [selectedId]);

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
      await load();
      if (selectedId) {
        const ext = await fetchDocumentExtractions(selectedId);
        setExtractions(ext);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setLoading(false);
    }
  }

  const selected = documents.find((d) => d.id === selectedId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">文档入库</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            从电子书 MDX 登记文档并触发 AI 抽取（默认 stub 规则引擎，无需 API Key）。
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()}>
          刷新
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center">快速导入：</span>
        {MDX_QUICK_IMPORT.map((item) => (
          <Button
            key={item.slug}
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() =>
              run(async () => {
                const doc = await registerDocumentFromMdx(item.kind, item.slug);
                setSelectedId(doc.id);
              })
            }
          >
            {item.label}
          </Button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无文档。使用上方按钮从 MDX 导入。</p>
          ) : (
            documents.map((doc) => (
              <Card
                key={doc.id}
                className={selectedId === doc.id ? 'ring-2 ring-blue-500/50' : ''}
                onClick={() => setSelectedId(doc.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{doc.title}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {doc.ingestionStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{doc.id}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    size="sm"
                    disabled={loading || doc.ingestionStatus === 'ingesting'}
                    onClick={(e) => {
                      e.stopPropagation();
                      run(async () => {
                        setSelectedId(doc.id);
                        await ingestDocument(doc.id);
                      });
                    }}
                  >
                    {doc.ingestionStatus === 'completed' ? '重新抽取' : 'AI 抽取'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <aside className="rounded-lg border bg-card p-4 h-fit sticky top-20 space-y-3">
          <h2 className="text-sm font-semibold">抽取记录</h2>
          {!selected ? (
            <p className="text-xs text-muted-foreground">选择文档查看抽取任务</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{selected.title}</p>
              {extractions.length === 0 ? (
                <p className="text-xs text-muted-foreground">尚无抽取任务</p>
              ) : (
                extractions.map((job) => (
                  <div key={job.id} className="text-xs space-y-1 border-t pt-2">
                    <div className="flex justify-between">
                      <span>{job.extractor}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {job.status}
                      </Badge>
                    </div>
                    {job.result && (
                      <p className="text-muted-foreground">
                        {job.result.assertionCount} 条候选 · {job.result.conflictCount} 条冲突
                      </p>
                    )}
                    {job.result && job.result.conflictCount > 0 && (
                      <ul className="list-disc pl-4 text-orange-600 dark:text-orange-400">
                        {job.result.conflicts.slice(0, 3).map((c) => (
                          <li key={c.candidateAssertionId}>{c.reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
