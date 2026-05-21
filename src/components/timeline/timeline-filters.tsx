'use client';

import { Button } from '@/components/ui/button';

export type EntityTypeFilter = 'all' | 'layer' | 'target' | 'concept';

interface TimelineFiltersProps {
  activeFilter: EntityTypeFilter;
  onFilterChange: (filter: EntityTypeFilter) => void;
  dates: string[];
}

const filterOptions: { value: EntityTypeFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'layer', label: '层级' },
  { value: 'target', label: '投资标的' },
  { value: 'concept', label: '知识点' },
];

export function TimelineFilters({
  activeFilter,
  onFilterChange,
}: TimelineFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={activeFilter === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
