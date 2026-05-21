import Link from 'next/link';
import type { ResearchEntityRef } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';

function hrefFor(ref: ResearchEntityRef): string {
  if (ref.type === 'Domain') return `/research/domains/${ref.slug}`;
  if (ref.type === 'Theme') return `/research/themes/${ref.slug}`;
  if (ref.type === 'Event') return `/research/events/${ref.id}`;
  return `/research/instruments/${ref.slug}`;
}

export function EntityRefList({
  items,
  emptyLabel = '暂无',
}: {
  items: ResearchEntityRef[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={hrefFor(item)}>
            <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
              {item.name}
            </Badge>
          </Link>
        </li>
      ))}
    </ul>
  );
}
