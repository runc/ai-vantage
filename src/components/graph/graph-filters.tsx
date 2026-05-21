'use client';

import { Panel } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { useState } from 'react';

export interface GraphFilters {
  nodeTypes: { layer: boolean; target: boolean; concept: boolean };
  certainty: { highest: boolean; high: boolean; medium: boolean; low: boolean; lowest: boolean };
  edgeTypes: {
    'belongs-to': boolean;
    'competes-with': boolean;
    'supplies-to': boolean;
    threatens: boolean;
    'relates-to': boolean;
  };
}

export const DEFAULT_FILTERS: GraphFilters = {
  nodeTypes: { layer: true, target: true, concept: true },
  certainty: { highest: true, high: true, medium: true, low: true, lowest: true },
  edgeTypes: {
    'belongs-to': true,
    'competes-with': true,
    'supplies-to': true,
    threatens: true,
    'relates-to': true,
  },
};

interface GraphFiltersProps {
  filters: GraphFilters;
  onChange: (filters: GraphFilters) => void;
}

const NODE_TYPE_LABELS: Record<string, string> = {
  layer: '层',
  target: '标的',
  concept: '概念',
};

const CERTAINTY_LABELS: Record<string, string> = {
  highest: '最高',
  high: '高',
  medium: '中',
  low: '低',
  lowest: '最低',
};

const EDGE_TYPE_LABELS: Record<string, string> = {
  'belongs-to': '属于',
  'competes-with': '竞争',
  'supplies-to': '供应',
  threatens: '威胁',
  'relates-to': '关联',
};

const EDGE_TYPE_COLORS: Record<string, string> = {
  'belongs-to': '#6b7280',
  'competes-with': '#ef4444',
  'supplies-to': '#3b82f6',
  threatens: '#f97316',
  'relates-to': '#8b5cf6',
};

export function GraphFiltersPanel({ filters, onChange }: GraphFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleNodeType = (key: keyof GraphFilters['nodeTypes']) => {
    onChange({
      ...filters,
      nodeTypes: { ...filters.nodeTypes, [key]: !filters.nodeTypes[key] },
    });
  };

  const toggleCertainty = (key: keyof GraphFilters['certainty']) => {
    onChange({
      ...filters,
      certainty: { ...filters.certainty, [key]: !filters.certainty[key] },
    });
  };

  const toggleEdgeType = (key: keyof GraphFilters['edgeTypes']) => {
    onChange({
      ...filters,
      edgeTypes: { ...filters.edgeTypes, [key]: !filters.edgeTypes[key] },
    });
  };

  return (
    <Panel position="top-left" className="!m-3">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent w-full transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          筛选
          {!expanded && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              {Object.values(filters.nodeTypes).filter(Boolean).length}/3
            </span>
          )}
        </button>

        {expanded && (
          <div className="border-t border-border p-3 space-y-3 w-56">
            {/* Node types */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                节点类型
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(Object.keys(filters.nodeTypes) as Array<keyof GraphFilters['nodeTypes']>).map(
                  (key) => (
                    <Button
                      key={key}
                      variant={filters.nodeTypes[key] ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => toggleNodeType(key)}
                    >
                      {NODE_TYPE_LABELS[key]}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Certainty */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                确定性
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(Object.keys(filters.certainty) as Array<keyof GraphFilters['certainty']>).map(
                  (key) => (
                    <Button
                      key={key}
                      variant={filters.certainty[key] ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-[10px] px-2"
                      onClick={() => toggleCertainty(key)}
                    >
                      {CERTAINTY_LABELS[key]}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Edge types */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                关系类型
              </span>
              <div className="flex flex-col gap-1.5 mt-1.5">
                {(Object.keys(filters.edgeTypes) as Array<keyof GraphFilters['edgeTypes']>).map(
                  (key) => (
                    <button
                      key={key}
                      onClick={() => toggleEdgeType(key)}
                      className={`flex items-center gap-2 px-2 py-1 rounded text-[11px] transition-colors ${
                        filters.edgeTypes[key]
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span
                        className="w-3 h-0.5 rounded-full"
                        style={{ backgroundColor: EDGE_TYPE_COLORS[key] }}
                      />
                      {EDGE_TYPE_LABELS[key]}
                      {filters.edgeTypes[key] && (
                        <Badge variant="secondary" className="ml-auto text-[8px] h-4 px-1">
                          ON
                        </Badge>
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-[10px]"
              onClick={() => onChange(DEFAULT_FILTERS)}
            >
              重置筛选
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}
