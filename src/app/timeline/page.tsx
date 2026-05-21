import { getAggregatedTimeline } from '@/lib/versioning';
import { TimelineView } from '@/components/timeline/timeline-view';

export default function TimelinePage() {
  const entries = getAggregatedTimeline();

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl mx-auto mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          版本演变
        </h1>
        <p className="mt-2 text-muted-foreground">
          投资逻辑变更记录
        </p>
      </header>

      <TimelineView entries={entries} />
    </div>
  );
}
