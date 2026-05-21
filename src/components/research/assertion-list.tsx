import type { AssertionDto } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function AssertionList({ assertions }: { assertions: AssertionDto[] }) {
  if (assertions.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无已收录判断</p>;
  }
  return (
    <ul className="space-y-3">
      {assertions.map((a) => (
        <li key={a.id} className="rounded-lg border bg-card/50 p-3 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {a.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              置信 {Math.round((a.confidence ?? 0) * 100)}%
            </span>
          </div>
          <p className="leading-relaxed">{a.claimText}</p>
          {(a.subjectName || a.objectName) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {a.subjectName}
              {a.objectName ? ` → ${a.objectName}` : ''}
            </p>
          )}
        </li>
      ))}
      <li>
        <Link href="/review/assertions" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
          在审核队列中查看全部 →
        </Link>
      </li>
    </ul>
  );
}
