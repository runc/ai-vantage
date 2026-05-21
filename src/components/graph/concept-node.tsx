'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ConceptNodeData {
  label: string;
  [key: string]: unknown;
}

export function ConceptNode({ data, selected }: NodeProps) {
  const { label } = data as unknown as ConceptNodeData;

  return (
    <>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-400" />
      <div
        className={`
          flex items-center justify-center
          w-[130px] h-[50px] rounded-lg px-3 py-2
          bg-gray-50 dark:bg-zinc-900
          border border-dashed border-gray-300 dark:border-zinc-600
          transition-all duration-200
          ${selected ? 'ring-2 ring-offset-1 ring-blue-500 scale-105' : ''}
        `}
      >
        <span className="text-[11px] italic font-medium text-gray-600 dark:text-gray-300 leading-tight text-center truncate">
          {label}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-400" />
    </>
  );
}
