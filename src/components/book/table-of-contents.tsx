"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TocChapter {
  slug: string;
  title: string;
  rank: number;
  certainty: "highest" | "high" | "medium" | "low" | "lowest";
}

const certaintyColors: Record<string, string> = {
  highest: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  high: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  lowest: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const certaintyLabels: Record<string, string> = {
  highest: "极高",
  high: "高",
  medium: "中",
  low: "低",
  lowest: "极低",
};

export function TableOfContents({
  chapters,
  onNavigate,
}: {
  chapters: TocChapter[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 py-2">
      <div className="mb-3 px-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          目录
        </h2>
      </div>
      {chapters.map((chapter) => {
        const isActive = pathname === `/book/${chapter.slug}`;
        return (
          <Link
            key={chapter.slug}
            href={`/book/${chapter.slug}`}
            onClick={onNavigate}
            className={cn(
              "group mx-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isActive
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
              )}
            >
              {chapter.rank}
            </span>
            <span className="flex-1 truncate font-medium leading-tight">
              {chapter.title}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 border-0 text-[10px]",
                certaintyColors[chapter.certainty]
              )}
            >
              {certaintyLabels[chapter.certainty]}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}
