import { notFound } from "next/navigation";
import { getLayerBySlug, getTargetsByLayer, getAllSlugs, getAllConcepts } from "@/lib/content";
import { renderMdx } from "@/lib/mdx";
import { Breadcrumb } from "@/components/explore/breadcrumb";
import { TargetCard } from "@/components/explore/target-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const certaintyConfig = {
  highest: { label: "确定性最高", color: "bg-green-500", textColor: "text-green-700 dark:text-green-400" },
  high: { label: "确定性高", color: "bg-lime-500", textColor: "text-lime-700 dark:text-lime-400" },
  medium: { label: "确定性中等", color: "bg-yellow-500", textColor: "text-yellow-700 dark:text-yellow-400" },
  low: { label: "确定性低", color: "bg-orange-500", textColor: "text-orange-700 dark:text-orange-400" },
  lowest: { label: "确定性最低", color: "bg-red-500", textColor: "text-red-700 dark:text-red-400" },
} as const;

export function generateStaticParams() {
  const slugs = getAllSlugs("layers");
  return slugs.map((slug) => ({ slug }));
}

export default async function LayerSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layer = getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  const { frontmatter, content } = layer;
  const targets = getTargetsByLayer(slug);
  const concepts = getAllConcepts().filter((c) =>
    frontmatter.relatedConcepts.includes(c.slug)
  );
  const config = certaintyConfig[frontmatter.certainty];
  const mdxContent = await renderMdx(content);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { label: "探索", href: "/explore" },
          { label: frontmatter.title },
        ]}
      />

      {/* Layer header */}
      <div className="mt-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="text-sm font-mono">
            #{frontmatter.rank}
          </Badge>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.color}`} />
            <span className={`text-sm font-medium ${config.textColor}`}>
              {config.label}
            </span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-3">
          {frontmatter.title}
        </h1>
        <p className="text-muted-foreground mt-2 text-base leading-relaxed">
          {frontmatter.summary}
        </p>
      </div>

      <Separator className="my-8" />

      {/* MDX Content */}
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-foreground/90">
        {mdxContent}
      </article>

      {/* Related targets */}
      {targets.length > 0 && (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              相关投资标的
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {targets.map((target) => (
                <TargetCard key={target.slug} target={target} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Related concepts */}
      {concepts.length > 0 && (
        <>
          <Separator className="my-8" />
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              相关概念
            </h2>
            <div className="flex flex-wrap gap-2">
              {concepts.map((concept) => (
                <Link key={concept.slug} href={`/book/${concept.slug}`}>
                  <Badge variant="secondary" className="text-sm cursor-pointer hover:bg-secondary/80">
                    {concept.frontmatter.title}
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
