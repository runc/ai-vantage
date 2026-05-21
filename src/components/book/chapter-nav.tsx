import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterInfo {
  slug: string;
  title: string;
}

export function ChapterNav({
  prev,
  next,
}: {
  prev: ChapterInfo | null;
  next: ChapterInfo | null;
}) {
  return (
    <div className="mt-12 flex items-stretch gap-4 border-t border-border/60 pt-8">
      {prev ? (
        <Link
          href={`/book/${prev.slug}`}
          className="group flex flex-1 flex-col items-start gap-1 rounded-lg border border-border/60 px-5 py-4 transition-colors hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:border-blue-400/30 dark:hover:bg-blue-950/20"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronLeft className="size-3" />
            上一章
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/book/${next.slug}`}
          className="group flex flex-1 flex-col items-end gap-1 rounded-lg border border-border/60 px-5 py-4 transition-colors hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:border-blue-400/30 dark:hover:bg-blue-950/20"
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            下一章
            <ChevronRight className="size-3" />
          </span>
          <span className="text-sm font-medium text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
