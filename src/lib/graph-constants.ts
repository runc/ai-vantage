/**
 * Color mapping for layer certainty levels.
 * Extracted into a separate file so client components can import without
 * pulling in server-only modules (fs, path).
 */
export const CERTAINTY_COLORS: Record<string, string> = {
  highest: '#22c55e', // green
  high: '#84cc16', // lime
  medium: '#eab308', // yellow
  low: '#f97316', // orange
  lowest: '#ef4444', // red
};

/** Edge type to visual style mapping */
export const EDGE_STYLES: Record<string, { stroke: string; strokeDasharray?: string }> = {
  'belongs-to': { stroke: '#6b7280' },
  'competes-with': { stroke: '#ef4444', strokeDasharray: '5 5' },
  'supplies-to': { stroke: '#3b82f6' },
  threatens: { stroke: '#f97316', strokeDasharray: '3 3' },
  'relates-to': { stroke: '#8b5cf6', strokeDasharray: '2 4' },
};
