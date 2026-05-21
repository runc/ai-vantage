import Link from "next/link";
import {
  BookOpen,
  Network,
  History,
  Compass,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getAllLayers } from "@/lib/content";
import { getAggregatedTimeline } from "@/lib/versioning";

const CERTAINTY_CONFIG: Record<string, { label: string; color: string }> = {
  highest: { label: "最高确定性", color: "bg-emerald-600 text-white" },
  high: { label: "高确定性", color: "bg-emerald-500 text-white" },
  medium: { label: "中等确定性", color: "bg-amber-500 text-white" },
  low: { label: "低确定性", color: "bg-orange-500 text-white" },
  lowest: { label: "最低确定性", color: "bg-red-500 text-white" },
};

const VIEW_CARDS = [
  {
    title: "电子书",
    description: "以高信息密度的电子书形式，系统化阅读 AI 产业投资分析",
    icon: BookOpen,
    href: "/book",
  },
  {
    title: "知识图谱",
    description: "可视化产业层级、企业、概念之间的关联关系",
    icon: Network,
    href: "/graph",
  },
  {
    title: "版本演变",
    description: "追踪投资逻辑的变更记录，商场如战场，攻守易形",
    icon: History,
    href: "/timeline",
  },
  {
    title: "探索",
    description: "以产业层级和投资标的为核心，逐层深入分析",
    icon: Compass,
    href: "/explore",
  },
];

export default function Home() {
  const layers = getAllLayers();
  const timeline = getAggregatedTimeline();
  const recentUpdates = timeline.slice(0, 5);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background" />
        <div className="flex items-center gap-2 mb-6">
          <Layers className="size-8 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            AI Vantage
          </h1>
        </div>
        <p className="text-lg sm:text-xl font-medium text-muted-foreground mb-4">
          AI 产业投资图谱
        </p>
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed mb-10">
          深入解析 AI 产业七层结构，追踪投资逻辑的演变，以系统化视角理解 AI 时代的结构性机会。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <BookOpen className="size-4" />
            开始阅读
          </Link>
          <Link
            href="/graph"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Network className="size-4" />
            探索图谱
          </Link>
        </div>
      </section>

      {/* View Cards Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {VIEW_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group/link">
                <Card className="h-full transition-shadow hover:shadow-md hover:ring-foreground/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5 text-foreground" />
                      </div>
                      <CardTitle className="text-base font-semibold">
                        {card.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover/link:underline">
                      进入
                      <ChevronRight className="size-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Seven Layers Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            AI 产业七层结构
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            从最高确定性到最低确定性，自上而下构建投资认知
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {layers.map((layer) => {
            const certainty = CERTAINTY_CONFIG[layer.frontmatter.certainty] ?? {
              label: layer.frontmatter.certainty,
              color: "bg-muted text-muted-foreground",
            };
            return (
              <Link
                key={layer.slug}
                href={`/explore/layer/${layer.slug}`}
                className="group/layer flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm hover:border-foreground/20"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-lg text-foreground">
                  {layer.frontmatter.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover/layer:text-primary transition-colors">
                    {layer.frontmatter.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {layer.frontmatter.summary}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${certainty.color}`}
                >
                  {certainty.label}
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover/layer:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Updates Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            最近更新
          </h2>
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            查看全部
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        {recentUpdates.length > 0 ? (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {recentUpdates.map((entry, i) => {
              const entityHref =
                entry.entityType === "layer"
                  ? `/explore/layer/${entry.entityId}`
                  : entry.entityType === "target"
                    ? `/explore/target/${entry.entityId}`
                    : `/graph`;
              return (
                <div key={`${entry.entityId}-${entry.date}-${i}`} className="flex items-start gap-4 p-4">
                  <time className="shrink-0 text-xs font-mono text-muted-foreground pt-0.5">
                    {entry.date}
                  </time>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={entityHref}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {entry.entityTitle}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {entry.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              知识库将持续更新，追踪 AI 产业的最新变化。
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                AI Vantage © 2026
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                在别人看热闹的地方，看到机会。
              </p>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/book" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                电子书
              </Link>
              <Link href="/graph" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                知识图谱
              </Link>
              <Link href="/timeline" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                版本演变
              </Link>
              <Link href="/explore" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                探索
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
