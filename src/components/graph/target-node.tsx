'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CERTAINTY_COLORS } from '@/lib/graph-constants';

interface TargetNodeData {
  label: string;
  layer?: string;
  titleZh?: string;
  [key: string]: unknown;
}

const LAYER_LABELS: Record<string, string> = {
  'physical-engineering': '物理工程',
  'oligopoly': '寡头垄断',
  'cloud-platform': '云平台',
  'application-model': '应用模型',
  'chip-design': '芯片设计',
  'middle-squeeze': '中间挤压',
  'zero-barrier': '零壁垒',
};

const LAYER_CERTAINTY: Record<string, string> = {
  'physical-engineering': 'highest',
  'oligopoly': 'high',
  'cloud-platform': 'high',
  'chip-design': 'medium',
  'application-model': 'low',
  'middle-squeeze': 'low',
  'zero-barrier': 'lowest',
};

export function TargetNode({ data, selected }: NodeProps) {
  const { label, layer, titleZh } = data as unknown as TargetNodeData;
  const layerCertainty = layer ? LAYER_CERTAINTY[layer] : undefined;
  const borderColor = layerCertainty ? CERTAINTY_COLORS[layerCertainty] || '#6b7280' : '#6b7280';
  const layerLabel = layer ? LAYER_LABELS[layer] || layer : '';

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400" />
      <div
        className={`
          flex flex-col justify-center
          w-[150px] h-[60px] rounded-lg px-3 py-2
          bg-white dark:bg-zinc-800
          border border-gray-200 dark:border-zinc-700
          shadow-sm
          transition-all duration-200
          ${selected ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : ''}
        `}
        style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
      >
        <span className="text-xs font-semibold leading-tight truncate text-gray-900 dark:text-gray-100">
          {label}
        </span>
        {titleZh && titleZh !== label && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{titleZh}</span>
        )}
        {layerLabel && (
          <span
            className="mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full w-fit"
            style={{ backgroundColor: `${borderColor}20`, color: borderColor }}
          >
            {layerLabel}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" />
    </>
  );
}
