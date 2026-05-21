import { redirect } from "next/navigation";
import { getAllLayers } from "@/lib/content";

export default function BookPage() {
  const layers = getAllLayers();

  if (layers.length > 0) {
    redirect(`/book/${layers[0].slug}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        电子书
      </h1>
      <p className="mt-2 text-muted-foreground">暂无内容</p>
    </div>
  );
}
