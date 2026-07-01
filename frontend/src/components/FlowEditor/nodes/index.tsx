import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { Play, Search, Box, Zap, Flag } from 'lucide-react';

interface CustomNodeProps extends NodeProps<Node> {
  typeColor: string;
  icon: React.ReactNode;
  defaultLabel: string;
  handles: { type: 'source' | 'target', position: Position, id?: string, style?: any }[];
}

const BaseNode = memo(({ data, selected, typeColor, icon, defaultLabel, handles }: CustomNodeProps) => (
  <div className={`flow-node node-${typeColor} ${selected ? 'selected' : ''}`}>
    <div className="flow-node-icon">{icon}</div>
    {handles.map((h, i) => (
      <Handle 
        key={i} 
        type={h.type} 
        position={h.position} 
        id={h.id} 
        style={h.style} 
        className={`flow-handle ${h.position === Position.Left ? 'left' : 'right'}`} 
      />
    ))}
    <div className="flow-node-label">{data?.label as string || defaultLabel}</div>
  </div>
));

BaseNode.displayName = 'BaseNode';

export const StartNode = (props: NodeProps<Node>) => (
  <BaseNode {...props} typeColor="green" defaultLabel="Start" icon={<Play />} handles={[
    { type: 'source', position: Position.Right }
  ]} />
);

export const ScoutNode = (props: NodeProps<Node>) => (
  <BaseNode {...props} typeColor="blue" defaultLabel="Scout" icon={<Search />} handles={[
    { type: 'target', position: Position.Left },
    { type: 'source', position: Position.Right }
  ]} />
);

export const CompressorNode = (props: NodeProps<Node>) => (
  <BaseNode {...props} typeColor="amber" defaultLabel="Compressor" icon={<Box />} handles={[
    { type: 'target', position: Position.Left },
    { type: 'source', position: Position.Right }
  ]} />
);

export const DecisionNode = (props: NodeProps<Node>) => (
  <BaseNode {...props} typeColor="purple" defaultLabel="Decision" icon={<Zap />} handles={[
    { type: 'target', position: Position.Left },
    { type: 'source', position: Position.Right, id: 'true', style: { top: '25%' } },
    { type: 'source', position: Position.Right, id: 'false', style: { top: '75%', borderColor: '#f43f5e' } }
  ]} />
);

export const EndNode = (props: NodeProps<Node>) => (
  <BaseNode {...props} typeColor="rose" defaultLabel="End" icon={<Flag />} handles={[
    { type: 'target', position: Position.Left }
  ]} />
);

export const nodeTypes = {
  start: StartNode,
  scout: ScoutNode,
  compressor: CompressorNode,
  decision: DecisionNode,
  end: EndNode,
};
