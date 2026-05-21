import { notFound } from "next/navigation";
import { getTargetBySlug, getLayerBySlug, getAllSlugs } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { Breadcrumb } from "@/components/explore/breadcrumb";
import { InfoCard } from "@/components/explore/info-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function generateStaticParams() {
  const slugs = getAllSlugs("targets");
  return slugs.map((slug) => ({ slug }));
}

export default async function TargetSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = getTargetBySlug(slug);

  if (!target) {
    notFound();
  }

  const { frontmatter, content } = target;
  const layer = getLayerBySlug(frontmatter.layer);
  const mdxContent = await renderMdx(content);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { label: "探索", href: "/explore" },
          ...(layer
            ? [{ label: layer.frontmatter.title, href: `/explore/layer/${layer.slug}` }]
            : []),
          { label: frontmatter.titleZh || frontmatter.title },
        ]}
      />

      {/* Target header */}
      <div className="mt-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {frontmatter.title}
          {frontmatter.titleZh && (
            <span className="text-muted-foreground font-normal ml-2 text-xl sm:text-2xl">
              {frontmatter.titleZh}
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {layer && (
            <Link href={`/explore/layer/${layer.slug}`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                {layer.frontmatter.title}
              </Badge>
            </Link>
          )}
          {frontmatter.subgroup && (
            <Badge variant="secondary">{frontmatter.subgroup}</Badge>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <InfoCard type="moat" value={frontmatter.moat} />
        <InfoCard type="risk" value={frontmatter.risk} />
        <InfoCard type="marketPosition" value={frontmatter.marketPosition} />
      </div>

      <Separator className="my-8" />

      {/* MDX Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-foreground/90">
        {mdxContent}
      </article>

      {/* Related targets */}
      {frontmatter.relatedTargets.length > 0 && (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              相关标的
            </h2>
            <div className="flex flex-wrap gap-2">
              {frontmatter.relatedTargets.map((relSlug) => (
                <Link key={relSlug} href={`/explore/target/${relSlug}`}>
                  <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-secondary/80">
                    {relSlug}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
