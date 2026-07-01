import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2 rounded-full border-2 min-w-[80px] text-center ${selected ? 'border-green-500 shadow-lg' : 'border-green-300'} bg-green-50 text-black`}>
      <div className="text-sm font-bold text-green-700">🚀 {data.label as string || 'Start'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-400" />
    </div>
  );
});

StartNode.displayName = 'StartNode';
