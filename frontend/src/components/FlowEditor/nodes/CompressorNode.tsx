import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export type CompressorNodeData = {
  label: string;
  payload?: any;
};

export const CompressorNode = memo(({ data, selected }: NodeProps<CompressorNodeData>) => {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 min-w-[150px] ${selected ? 'border-orange-500 shadow-lg' : 'border-gray-300'} bg-white text-black`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-orange-400" />
      <div className="text-sm font-medium text-gray-700">📦 {data.label || 'Compressor'}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-400" id="output" />
    </div>
  );
});

CompressorNode.displayName = 'CompressorNode';
