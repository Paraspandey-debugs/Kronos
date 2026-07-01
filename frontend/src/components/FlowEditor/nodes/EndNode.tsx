import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2 rounded-full border-2 min-w-[80px] text-center ${selected ? 'border-red-500 shadow-lg' : 'border-red-300'} bg-red-50 text-black`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-red-400" />
      <div className="text-sm font-bold text-red-700">🏁 {data.label as string || 'End'}</div>
    </div>
  );
});

EndNode.displayName = 'EndNode';
