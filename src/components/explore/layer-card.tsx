import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LayerItem } from "@/lib/types";

const certaintyConfig = {
  highest: { label: "确定性最高", color: "bg-green-500", border: "border-l-green-500", badgeClass: "bg-green-500/10 text-green-700 dark:text-green-400" },
  high: { label: "确定性高", color: "bg-lime-500", border: "border-l-lime-500", badgeClass: "bg-lime-500/10 text-lime-700 dark:text-lime-400" },
  medium: { label: "确定性中等", color: "bg-yellow-500", border: "border-l-yellow-500", badgeClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  low: { label: "确定性低", color: "bg-orange-500", border: "border-l-orange-500", badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
  lowest: { label: "确定性最低", color: "bg-red-500", border: "border-l-red-500", badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400" },
} as const;

export function LayerCard({ layer }: { layer: LayerItem }) {
  const { frontmatter, slug } = layer;
  const config = certaintyConfig[frontmatter.certainty];

  return (
    <Link href={`/explore/layer/${slug}`} className="group block">
      <Card className={`relative border-l-4 ${config.border} transition-all duration-200 hover:shadow-lg hover:shadow-foreground/5 hover:-translate-y-0.5`}>
        <CardContent className="relative">
          {/* Rank number */}
          <div className="absolute top-0 right-0 text-4xl font-bold text-muted-foreground/20 leading-none select-none">
            {frontmatter.rank}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground pr-10">
            {frontmatter.title}
          </h3>

          {/* Certainty indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-block h-2 w-2 rounded-full ${config.color}`} />
            <span className={`text-xs font-medium ${config.badgeClass} px-1.5 py-0.5 rounded`}>
              {config.label}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
            {frontmatter.summary}
          </p>

          {/* Representatives */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {frontmatter.representatives.slice(0, 4).map((rep) => (
              <Badge key={rep} variant="secondary" className="text-xs">
                {rep}
              </Badge>
            ))}
            {frontmatter.representatives.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{frontmatter.representatives.length - 4}
              </Badge>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-end mt-3">
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
