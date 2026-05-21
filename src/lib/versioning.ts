import { getAllLayers, getAllTargets, getAllConcepts } from './content';
import type { ChangelogEntry } from './types';

export interface TimelineEntry {
  date: string;
  entityId: string;
  entityTitle: string;
  entityType: 'layer' | 'target' | 'concept';
  note: string;
}

/**
 * Aggregate changelog entries from ALL content entities into a single timeline.
 * Sorted by date descending (newest first).
 */
export function getAggregatedTimeline(): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  const layers = getAllLayers();
  const targets = getAllTargets();
  const concepts = getAllConcepts();

  for (const layer of layers) {
    const changelog: ChangelogEntry[] = layer.frontmatter.changelog ?? [];
    for (const entry of changelog) {
      entries.push({
        date: entry.date,
        entityId: layer.frontmatter.id,
        entityTitle: layer.frontmatter.title,
        entityType: 'layer',
        note: entry.note,
      });
    }
  }

  for (const target of targets) {
    const changelog: ChangelogEntry[] = target.frontmatter.changelog ?? [];
    for (const entry of changelog) {
      entries.push({
        date: entry.date,
        entityId: target.frontmatter.id,
        entityTitle: target.frontmatter.title,
        entityType: 'target',
        note: entry.note,
      });
    }
  }

  for (const concept of concepts) {
    const changelog: ChangelogEntry[] = concept.frontmatter.changelog ?? [];
    for (const entry of changelog) {
      entries.push({
        date: entry.date,
        entityId: concept.frontmatter.id,
        entityTitle: concept.frontmatter.title,
        entityType: 'concept',
        note: entry.note,
      });
    }
  }

  // Sort by date descending (newest first)
  entries.sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  return entries;
}

/**
 * Filter timeline entries by entity type and/or date range.
 */
export function filterTimeline(
  entries: TimelineEntry[],
  filters: {
    entityType?: 'layer' | 'target' | 'concept';
    startDate?: string;
    endDate?: string;
  }
): TimelineEntry[] {
  return entries.filter((entry) => {
    if (filters.entityType && entry.entityType !== filters.entityType) {
      return false;
    }
    if (filters.startDate && entry.date < filters.startDate) {
      return false;
    }
    if (filters.endDate && entry.date > filters.endDate) {
      return false;
    }
    return true;
  });
}
