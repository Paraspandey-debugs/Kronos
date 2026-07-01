import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAgentTemplates } from '../../../lib/api';
import { useAuth } from '@clerk/clerk-react';

// Fallback algorithm to deterministically pick a color based on type string
const colors = ['n-blue', 'n-green', 'n-amber', 'n-purple', 'n-rose', 'n-teal'];
const getColorForType = (type: string) => {
  if (type === 'start') return 'n-green';
  if (type === 'end') return 'n-rose';
  if (type === 'decision') return 'n-purple';
  
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const DynamicNode = memo(({ data, type, selected }: NodeProps<Node>) => {
  const { getToken } = useAuth();
  const { data: templates = [] } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      const token = await getToken();
      return fetchAgentTemplates(token || '');
    }
  });

  const template = templates.find((t: any) => t.type === type);
  
  const status = (data?.status as string) || 'idle';
  
  // Resolve UI config from template, with smart defaults
  const typeLabel = template?.label || type;
  const iconName = template?.icon || (type === 'start' ? 'Play' : type === 'end' ? 'Flag' : type === 'decision' ? 'Zap' : 'Box');
  const colorClass = template?.color || getColorForType(type);
  
  const hasInput = type !== 'start';
  const hasOutput = type !== 'end' && type !== 'decision';
  const outputIds = type === 'decision' ? ['true', 'false'] : undefined;
  
  // Dynamically resolve icon from Lucide
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;

  return (
    <div className={`kn-node ${colorClass} ${selected ? 'selected' : ''}`}>
      {/* Target handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="kn-handle kn-handle-left"
        />
      )}

      {/* Icon badge */}
      <div className="kn-icon">
        <Icon size={16} />
      </div>

      {/* Text */}
      <div className="kn-body">
        <span className="kn-name">{(data?.label as string) || typeLabel}</span>
        <span className="kn-type">{typeLabel}</span>
      </div>

      {/* Status dot */}
      <div className={`kn-status ${status}`} title={status} />

      {/* Source handle(s) */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="kn-handle kn-handle-right"
        />
      )}
      {outputIds?.map((id, i) => (
        <Handle
          key={id}
          type="source"
          position={Position.Right}
          id={id}
          className="kn-handle kn-handle-right"
          style={{ top: `${25 + i * 50}%` }}
        />
      ))}
    </div>
  );
});
DynamicNode.displayName = 'DynamicNode';
