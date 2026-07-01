import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';

export const DecisionNode = memo(({ data, selected }: NodeProps<Node>) => {
  return (
    <div className={`px-4 py-2 rounded-lg border-2 border-dashed min-w-[120px] ${selected ? 'border-purple-500 shadow-lg' : 'border-purple-300'} bg-purple-50 text-black`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-sm font-medium text-purple-700">⚡ {data.label as string || 'Decision'}</div>
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-green-400" style={{ left: '30%' }} />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-red-400" style={{ left: '70%' }} />
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
