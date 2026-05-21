import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

export function Breadcrumb({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={index} className="flex items-center gap-1.5 shrink-0">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
            {isLast || !segment.href ? (
              <span className={isLast ? "text-foreground font-medium truncate max-w-[200px] sm:max-w-none" : "truncate max-w-[120px] sm:max-w-none"}>
                {segment.label}
              </span>
            ) : (
              <Link
                href={segment.href}
                className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
              >
                {segment.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
