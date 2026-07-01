import { useState } from 'react';
import { Trash2, Database } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import { VariablePicker } from './VariablePicker';
import { getAvailableVariables } from './utils/variables';

interface Props {
  node: Node | null;
  nodes: Node[];
  edges: Edge[];
  templates: any[];
  onUpdate: (node: Node) => void;
  onDelete: (id: string) => void;
}

export const PropertiesPanel: React.FC<Props> = ({ node, nodes, edges, templates, onUpdate, onDelete }) => {
  const [pickerOpenKey, setPickerOpenKey] = useState<string | null>(null);

  if (!node) {
    return (
      <aside className="w-80 border-l border-[rgba(255,255,255,0.1)] bg-[#111111] flex flex-col shrink-0 z-10 h-full p-4 items-center justify-center text-[#a1a1aa]">
        <p className="text-sm">Select a node to configure</p>
      </aside>
    );
  }

  const template = templates.find(t => t.type === node.type);
  const configSchema = template?.configSchema;
  
  let payload: any = {};
  try {
    payload = typeof node.data?.payload === 'string' ? JSON.parse(node.data.payload) : (node.data?.payload || {});
  } catch {
    // If it's temporarily invalid JSON, just use empty object for the form
  }

  const updatePayloadField = (key: string, value: any) => {
    const updatedPayload = { ...payload, [key]: value };
    onUpdate({
      ...node,
      data: { ...node.data, payload: JSON.stringify(updatedPayload, null, 2) }
    });
  };

  const handlePayloadChange = (value: string) => {
    onUpdate({
      ...node,
      data: { ...node.data, payload: value },
    });
  };

  return (
    <aside className="w-80 border-l border-[rgba(255,255,255,0.1)] bg-[#111111] flex flex-col shrink-0 z-10 h-full">
      <div className="p-4 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
          <h2 className="text-sm font-medium text-indigo-400 capitalize">{template?.label || node.type} Node Settings</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] mt-2">{template?.description || 'Configure parameters for this node.'}</p>
      </div>
      
      <div className="p-4 flex flex-col gap-5 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide">
            Node Label
          </label>
          <input 
            type="text" 
            value={node.data?.label as string || ''}
            onChange={(e) => onUpdate({ ...node, data: { ...node.data, label: e.target.value } })}
            className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" 
          />
        </div>

        {configSchema?.properties && Object.keys(configSchema.properties).length > 0 ? (
          Object.entries(configSchema.properties).map(([key, prop]: [string, any]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide">{prop.title || key}</label>
              
              {prop.ui?.component === 'VariablePicker' ? (
                <div className="relative">
                  <input
                    type="text"
                    value={payload[key] || ''}
                    onChange={(e) => updatePayloadField(key, e.target.value)}
                    placeholder={prop.ui?.placeholder || "Select a variable..."}
                    className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    onClick={() => setPickerOpenKey(key)}
                    className="absolute right-2 top-[50%] -translate-y-[50%] text-indigo-400 hover:text-indigo-300 bg-[#111111] p-1 rounded"
                  >
                    <Database size={14} />
                  </button>
                  <VariablePicker
                    isOpen={pickerOpenKey === key}
                    onClose={() => setPickerOpenKey(null)}
                    onSelect={(val) => {
                      updatePayloadField(key, val);
                      setPickerOpenKey(null);
                    }}
                    availableVariables={getAvailableVariables(nodes, edges, node.id, templates)}
                  />
                </div>
              ) : prop.ui?.component === 'Select' ? (
                <select
                  value={payload[key] || prop.default}
                  onChange={(e) => updatePayloadField(key, e.target.value)}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {prop.enum?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={payload[key] || ''}
                  onChange={(e) => updatePayloadField(key, e.target.value)}
                  placeholder={prop.ui?.placeholder}
                  className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide flex items-center justify-between">
              Data Payload
            </label>
            <textarea 
              rows={8} 
              value={typeof node.data?.payload === 'string' ? node.data.payload : JSON.stringify(node.data?.payload || {}, null, 2)}
              onChange={(e) => handlePayloadChange(e.target.value)}
              className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] rounded px-3 py-2 text-sm text-[#a1a1aa] font-mono focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="{}"
            />
          </div>
        )}

        <button 
          onClick={() => onDelete(node.id)}
          className="w-full mt-2 bg-red-950/30 hover:bg-red-950/50 border border-red-900/50 text-red-400 rounded py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> Delete Node
        </button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
