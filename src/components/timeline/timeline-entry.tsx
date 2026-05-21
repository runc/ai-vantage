import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { TimelineEntry } from '@/lib/versioning';

interface TimelineEntryCardProps {
  entry: TimelineEntry;
  isLast?: boolean;
}

function getEntityLink(entry: TimelineEntry): string {
  switch (entry.entityType) {
    case 'layer':
      return `/explore/layer/${entry.entityId}`;
    case 'target':
      return `/explore/target/${entry.entityId}`;
    case 'concept':
      return `/book/${entry.entityId}`;
  }
}

function getEntityBadgeColor(type: TimelineEntry['entityType']): string {
  switch (type) {
    case 'layer':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'target':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'concept':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
  }
}

function getEntityBadgeLabel(type: TimelineEntry['entityType']): string {
  switch (type) {
    case 'layer':
      return '层级';
    case 'target':
      return '投资标的';
    case 'concept':
      return '知识点';
  }
}

function getDotColor(type: TimelineEntry['entityType']): string {
  switch (type) {
    case 'layer':
      return 'bg-emerald-500 dark:bg-emerald-400';
    case 'target':
      return 'bg-blue-500 dark:bg-blue-400';
    case 'concept':
      return 'bg-purple-500 dark:bg-purple-400';
  }
}

export function TimelineEntryCard({ entry, isLast }: TimelineEntryCardProps) {
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Timeline line and dot */}
      <div className="relative flex flex-col items-center">
        <div
          className={`z-10 h-3 w-3 shrink-0 rounded-full ring-4 ring-background ${getDotColor(entry.entityType)}`}
        />
        {!isLast && (
          <div className="absolute top-3 h-full w-px bg-border" />
        )}
      </div>

      {/* Entry content */}
      <div className="flex-1 -mt-0.5 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Link
            href={getEntityLink(entry)}
            className="font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {entry.entityTitle}
          </Link>
          <Badge
            className={`text-[10px] px-1.5 py-0 h-4 border-0 ${getEntityBadgeColor(entry.entityType)}`}
          >
            {getEntityBadgeLabel(entry.entityType)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {entry.note}
        </p>
      </div>
    </div>
  );
}
