'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CERTAINTY_COLORS } from '@/lib/graph-constants';

interface LayerNodeData {
  label: string;
  certainty?: string;
  rank?: number;
  [key: string]: unknown;
}

export function LayerNode({ data, selected }: NodeProps) {
  const { label, certainty, rank } = data as unknown as LayerNodeData;
  const bgColor = certainty ? CERTAINTY_COLORS[certainty] || '#6b7280' : '#6b7280';

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400" />
      <div
        className={`
          flex items-center justify-between gap-2
          w-[200px] h-[80px] rounded-xl px-4 py-3
          border-2 shadow-md
          transition-all duration-200
          ${selected ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''}
        `}
        style={{
          backgroundColor: bgColor,
          borderColor: bgColor,
          color: '#fff',
        }}
      >
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-bold leading-tight truncate">{label}</span>
          {certainty && (
            <span className="text-[10px] opacity-80 capitalize">{certainty}</span>
          )}
        </div>
        {rank != null && (
          <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-xs font-bold">
            #{rank}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" />
    </>
  );
}
