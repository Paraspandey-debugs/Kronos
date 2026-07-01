import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export type ScoutNodeData = {
  label: string;
  payload?: any;
};

export const ScoutNode = memo(({ data, selected }: NodeProps<ScoutNodeData>) => {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 min-w-[150px] ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'} bg-white text-black`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
      <div className="text-sm font-medium text-gray-700">🔍 {data.label || 'Scout'}</div>
      {data.payload?.target && (
        <div className="text-xs text-gray-500 mt-1">Target: {data.payload.target}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-400" id="output" />
    </div>
  );
});

ScoutNode.displayName = 'ScoutNode';
