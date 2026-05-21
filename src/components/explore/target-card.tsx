import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TargetItem } from "@/lib/types";

export function TargetCard({ target }: { target: TargetItem }) {
  const { frontmatter, slug } = target;

  return (
    <Link href={`/explore/target/${slug}`} className="group block">
      <Card className="transition-all duration-200 hover:shadow-md hover:shadow-foreground/5 hover:-translate-y-0.5">
        <CardContent>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">
                {frontmatter.title}
                {frontmatter.titleZh && (
                  <span className="text-muted-foreground font-normal ml-1.5 text-sm">
                    {frontmatter.titleZh}
                  </span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {frontmatter.moat}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <Badge variant="outline" className="text-xs">
              {frontmatter.layer}
            </Badge>
            {frontmatter.subgroup && (
              <Badge variant="secondary" className="text-xs">
                {frontmatter.subgroup}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
