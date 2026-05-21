import { notFound } from "next/navigation";
import { getAllLayers, getLayerBySlug } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { getBookMdxComponents } from "@/components/book/mdx-components";
import { BookLayout } from "@/components/book/book-layout";
import { ChapterNav } from "@/components/book/chapter-nav";
import { Badge } from "@/components/ui/badge";

const certaintyColors: Record<string, string> = {
  highest: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  high: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  lowest: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const certaintyLabels: Record<string, string> = {
  highest: "确定性极高",
  high: "确定性高",
  medium: "确定性中",
  low: "确定性低",
  lowest: "确定性极低",
};

export async function generateStaticParams() {
  const layers = getAllLayers();
  return layers.map((layer) => ({ slug: layer.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layer = getLayerBySlug(slug);
  if (!layer) return { title: "章节未找到" };

  return {
    title: `${layer.frontmatter.title} - AI Vantage 电子书`,
    description: layer.frontmatter.summary,
  };
}

export default async function BookSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layer = getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  const allLayers = getAllLayers();
  const currentIndex = allLayers.findIndex((l) => l.slug === slug);

  const chapters = allLayers.map((l) => ({
    slug: l.slug,
    title: l.frontmatter.title,
    rank: l.frontmatter.rank,
    certainty: l.frontmatter.certainty,
  }));

  const prev =
    currentIndex > 0
      ? { slug: allLayers[currentIndex - 1].slug, title: allLayers[currentIndex - 1].frontmatter.title }
      : null;

  const next =
    currentIndex < allLayers.length - 1
      ? { slug: allLayers[currentIndex + 1].slug, title: allLayers[currentIndex + 1].frontmatter.title }
      : null;

  const components = getBookMdxComponents();
  const content = await renderMdx(layer.content, components);

  const { frontmatter } = layer;

  return (
    <BookLayout chapters={chapters}>
      {/* Chapter header */}
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white dark:bg-blue-500">
            {frontmatter.rank}
          </span>
          <Badge
            variant="outline"
            className={`border-0 ${certaintyColors[frontmatter.certainty]}`}
          >
            {certaintyLabels[frontmatter.certainty]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {frontmatter.summary}
        </p>
        {frontmatter.representatives.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">代表企业：</span>
            {frontmatter.representatives.map((rep) => (
              <Badge key={rep} variant="secondary" className="text-xs">
                {rep.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="border-b border-border/60" />

      {/* MDX content */}
      <article className="book-prose mt-8 text-[17px] leading-[1.9] text-foreground/90">
        {content}
      </article>

      {/* Prev/Next navigation */}
      <ChapterNav prev={prev} next={next} />
    </BookLayout>
  );
}
