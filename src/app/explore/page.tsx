import { getAllLayers } from "@/lib/content";
import { LayerCard } from "@/components/explore/layer-card";

export default function ExplorePage() {
  const layers = getAllLayers();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          探索 AI 产业投资图谱
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          以产业层级为核心，深入了解AI投资的结构性机会
        </p>
      </div>

      {/* Layer grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {layers.map((layer) => (
          <LayerCard key={layer.slug} layer={layer} />
        ))}
      </div>
    </div>
  );
}
