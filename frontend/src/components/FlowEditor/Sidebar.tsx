import React from 'react';
import { Play, Search, Box, Zap, Flag } from 'lucide-react';

const STYLING_MAP: any = {
  start: { icon: <Play size={20} className="text-green-400" />, bg: 'bg-green-950/60', border: 'border-green-500', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]' },
  scout: { icon: <Search size={20} className="text-blue-400" />, bg: 'bg-blue-950/60', border: 'border-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  compressor: { icon: <Box size={20} className="text-amber-400" />, bg: 'bg-amber-950/60', border: 'border-amber-500', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
  decision: { icon: <Zap size={20} className="text-purple-400" />, bg: 'bg-purple-950/60', border: 'border-purple-500', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
  end: { icon: <Flag size={20} className="text-rose-400" />, bg: 'bg-rose-950/60', border: 'border-rose-500', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
};

export const Sidebar: React.FC<{ templates?: any[] }> = ({ templates = [] }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-[rgba(255,255,255,0.1)] bg-[#111111] flex flex-col shrink-0 z-10 h-full">
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
        <h2 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Node Types</h2>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto">
        {templates.map(({ type, label, description }) => {
          const style = STYLING_MAP[type] || STYLING_MAP.scout; // fallback
          return (
            <div
              key={type}
              className="flex items-center gap-4 group cursor-grab"
              draggable
              onDragStart={(e) => onDragStart(e, type)}
            >
              <div className={`w-12 h-12 rounded-xl ${style.bg} border-2 ${style.border} ${style.shadow} transition-all flex items-center justify-center shrink-0`}>
                {style.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">{label}</h3>
                <p className="text-xs text-[#a1a1aa]">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
