import React from 'react';

const NODE_TYPES = [
  { type: 'start', label: 'Start', icon: '🚀' },
  { type: 'scout', label: 'Scout', icon: '🔍' },
  { type: 'compressor', label: 'Compressor', icon: '📦' },
  { type: 'decision', label: 'Decision', icon: '⚡' },
  { type: 'end', label: 'End', icon: '🏁' },
];

export const Sidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto text-black">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
        Nodes
      </h3>
      <div className="space-y-2">
        {NODE_TYPES.map(({ type, label, icon }) => (
          <div
            key={type}
            className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 transition-colors flex items-center"
            draggable
            onDragStart={(e) => onDragStart(e, type)}
          >
            <span className="mr-2 text-xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Drag nodes onto the canvas
      </p>
    </div>
  );
};

export default Sidebar;
