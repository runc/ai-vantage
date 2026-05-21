'use client';

import { useMemo, useState } from 'react';
import { Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TimelineFilters, type EntityTypeFilter } from './timeline-filters';
import { TimelineEntryCard } from './timeline-entry';
import type { TimelineEntry } from '@/lib/versioning';

interface TimelineViewProps {
  entries: TimelineEntry[];
}

function formatDateChinese(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

interface GroupedEntries {
  date: string;
  dateFormatted: string;
  entries: TimelineEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState<EntityTypeFilter>('all');

  const dates = useMemo(() => {
    const uniqueDates = [...new Set(entries.map((e) => e.date))];
    return uniqueDates.sort((a, b) => (a > b ? -1 : 1));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return entries;
    return entries.filter((e) => e.entityType === activeFilter);
  }, [entries, activeFilter]);

  const grouped = useMemo<GroupedEntries[]>(() => {
    const map = new Map<string, TimelineEntry[]>();
    for (const entry of filteredEntries) {
      const existing = map.get(entry.date) ?? [];
      existing.push(entry);
      map.set(entry.date, existing);
    }
    return Array.from(map.entries()).map(([date, items]) => ({
      date,
      dateFormatted: formatDateChinese(date),
      entries: items,
    }));
  }, [filteredEntries]);

  const isInitialVersion = dates.length <= 1;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Initial version notice */}
      {isInitialVersion && (
        <Card className="mb-8 border-dashed">
          <CardContent className="flex gap-3 items-start">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-foreground">
                这是知识库的初始版本。随着市场变化和新分析的加入，您将在此看到信息的演变历程。
              </p>
              <p className="text-sm text-muted-foreground italic">
                攻守易形，商场如战场。投资逻辑不是静态的。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-8">
        <TimelineFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          dates={dates}
        />
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">暂无匹配的时间线记录</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-base font-semibold text-foreground whitespace-nowrap">
                  {group.dateFormatted}
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Entries */}
              <div className="pl-2">
                {group.entries.map((entry, idx) => (
                  <TimelineEntryCard
                    key={`${entry.entityId}-${entry.date}-${idx}`}
                    entry={entry}
                    isLast={idx === group.entries.length - 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
