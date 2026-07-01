import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Props { templates?: any[]; }

const colors = ['n-blue', 'n-green', 'n-amber', 'n-purple', 'n-rose', 'n-teal'];
const getColorForType = (type: string) => {
  if (type === 'start') return 'n-green';
  if (type === 'end') return 'n-rose';
  if (type === 'decision') return 'n-purple';
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const Sidebar: React.FC<Props> = ({ templates = [] }) => {
  const [query, setQuery] = useState('');

  const filtered = templates.filter(t =>
    t.label.toLowerCase().includes(query.toLowerCase()) ||
    t.type.toLowerCase().includes(query.toLowerCase())
  );

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const colorMap: Record<string, { bg: string; fg: string }> = {
    'n-green':  { bg: 'rgba(34,197,94,0.12)',  fg: '#22c55e' },
    'n-blue':   { bg: 'rgba(59,130,246,0.12)', fg: '#3b82f6' },
    'n-amber':  { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
    'n-purple': { bg: 'rgba(168,85,247,0.12)', fg: '#a855f7' },
    'n-rose':   { bg: 'rgba(244,63,94,0.12)',  fg: '#f43f5e' },
    'n-teal':   { bg: 'rgba(20,184,166,0.12)', fg: '#14b8a6' },
  };

  return (
    <aside className="fe-sidebar">
      {/* Search */}
      <div className="fe-sidebar-search">
        <Search size={13} color="#52525b" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search nodes..."
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ color: '#52525b', cursor: 'pointer', background: 'transparent', border: 'none' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Section label */}
      <div style={{ padding: '10px 12px 4px', fontSize: 10.5, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Nodes
      </div>

      {/* Node list */}
      <div className="fe-sidebar-nodes">
        {filtered.map(({ type, label, description, icon, color }) => {
          const iconName = icon || (type === 'start' ? 'Play' : type === 'end' ? 'Flag' : type === 'decision' ? 'Zap' : 'Box');
          const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
          
          const resolvedColor = color || getColorForType(type);
          const c = colorMap[resolvedColor] || colorMap['n-blue'];

          return (
            <div
              key={type}
              className="fe-node-item"
              draggable
              onDragStart={e => onDragStart(e, type)}
              title={description}
            >
              <div className="fe-node-badge" style={{ background: c.bg }}>
                <Icon size={15} color={c.fg} />
              </div>
              <div className="fe-node-info">
                <strong>{label}</strong>
                <span>{description}</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: '#52525b', fontSize: 12 }}>
            No nodes match "{query}"
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#3f3f46' }}>
        Drag a node onto the canvas
      </div>
    </aside>
  );
};

export default Sidebar;
