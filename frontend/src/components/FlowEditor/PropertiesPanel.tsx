import { useState, useRef } from 'react';
import { Trash2, Database, X, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
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
  onClose?: () => void;
}

const colors = ['n-blue', 'n-green', 'n-amber', 'n-purple', 'n-rose', 'n-teal'];
const getColorForType = (type: string) => {
  if (type === 'start') return 'n-green';
  if (type === 'end') return 'n-rose';
  if (type === 'decision') return 'n-purple';
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const PropertiesPanel: React.FC<Props> = ({
  node, nodes, edges, templates, onUpdate, onDelete, onClose,
}) => {
  const [pickerKey, setPickerKey] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!node) return null;

  const template = templates.find(t => t.type === node.type);
  const configSchema = template?.configSchema;

  let payload: any = {};
  try {
    payload = typeof node.data?.payload === 'string'
      ? JSON.parse(node.data.payload)
      : (node.data?.payload || {});
  } catch { /* editing in progress */ }

  const updatePayloadField = (key: string, value: any) => {
    onUpdate({ ...node, data: { ...node.data, payload: JSON.stringify({ ...payload, [key]: value }, null, 2) } });
  };

  const updateLabel = (label: string) => {
    onUpdate({ ...node, data: { ...node.data, label } });
  };

  const colorMap: Record<string, string> = {
    'n-green': '#22c55e', 'n-blue': '#3b82f6', 'n-amber': '#f59e0b',
    'n-purple': '#a855f7', 'n-rose': '#f43f5e', 'n-teal': '#14b8a6',
  };

  const iconName = template?.icon || (node.type === 'start' ? 'Play' : node.type === 'end' ? 'Flag' : node.type === 'decision' ? 'Zap' : 'Box');
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
  const resolvedColor = template?.color || getColorForType(node.type || '');
  const accentColor = colorMap[resolvedColor] || '#6366f1';

  return (
    <aside className="fe-props" style={{ borderLeft: `1px solid rgba(255,255,255,0.07)` }}>
      {/* Header */}
      <div className="fe-props-header">
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: `${accentColor}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={14} color={accentColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#f5f5f5', lineHeight: 1.3 }}>
            {template?.label || node.type}
          </div>
          <div style={{ fontSize: 10.5, color: '#71717a' }}>
            {template?.description || 'Configure this node'}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: '#71717a', cursor: 'pointer', flexShrink: 0, background: 'transparent', border: 'none' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="fe-props-body">

        {/* Node label */}
        <div className="fe-field">
          <label className="fe-label">Label</label>
          <input
            className="fe-input"
            value={(node.data?.label as string) || ''}
            onChange={e => updateLabel(e.target.value)}
            placeholder="Node label..."
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -16px' }} />

        {/* Config fields from schema */}
        {configSchema?.properties && Object.keys(configSchema.properties).length > 0 ? (
          Object.entries(configSchema.properties).map(([key, prop]: [string, any]) => (
            <div key={key} className="fe-field">
              <label className="fe-label">{prop.title || key}</label>

              {prop.ui?.component === 'VariablePicker' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    className="fe-input"
                    style={{ paddingRight: 30 }}
                    value={payload[key] || ''}
                    onChange={e => updatePayloadField(key, e.target.value)}
                    placeholder={prop.ui?.placeholder || '$step_0.field'}
                  />
                  <button
                    onClick={() => setPickerKey(key)}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      color: '#6366f1', cursor: 'pointer', background: 'transparent', border: 'none'
                    }}
                    title="Pick a variable"
                  >
                    <Database size={13} />
                  </button>
                  <VariablePicker
                    isOpen={pickerKey === key}
                    onClose={() => setPickerKey(null)}
                    onSelect={val => { updatePayloadField(key, val); setPickerKey(null); }}
                    availableVariables={getAvailableVariables(nodes, edges, node.id, templates)}
                  />
                </div>

              ) : prop.ui?.component === 'Select' ? (
                <select
                  className="fe-select"
                  value={payload[key] ?? prop.default}
                  onChange={e => updatePayloadField(key, e.target.value)}
                >
                  {prop.enum?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

              ) : (
                <input
                  className="fe-input"
                  type={prop.type === 'number' ? 'number' : 'text'}
                  value={payload[key] ?? ''}
                  onChange={e => updatePayloadField(key, e.target.value)}
                  placeholder={prop.ui?.placeholder}
                />
              )}
            </div>
          ))
        ) : (
          <div className="fe-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="fe-label">Payload (JSON)</label>
              <button
                onClick={() => setPickerKey('raw-json')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: '#6366f1', cursor: 'pointer', background: 'transparent', border: 'none',
                  fontSize: 10, fontWeight: 500
                }}
                title="Insert Variable"
              >
                <Database size={11} /> Insert Var
              </button>
            </div>
            <textarea
              ref={textareaRef}
              className="fe-textarea"
              rows={7}
              value={typeof node.data?.payload === 'string' ? node.data.payload : JSON.stringify(node.data?.payload || {}, null, 2)}
              onChange={e => onUpdate({ ...node, data: { ...node.data, payload: e.target.value } })}
              placeholder="{}"
            />
            <VariablePicker
              isOpen={pickerKey === 'raw-json'}
              onClose={() => setPickerKey(null)}
              onSelect={val => {
                if (textareaRef.current) {
                  const start = textareaRef.current.selectionStart;
                  const end = textareaRef.current.selectionEnd;
                  const currentVal = typeof node.data?.payload === 'string' ? node.data.payload : JSON.stringify(node.data?.payload || {}, null, 2);
                  const newVal = currentVal.substring(0, start) + `"${val}"` + currentVal.substring(end);
                  onUpdate({ ...node, data: { ...node.data, payload: newVal } });
                }
                setPickerKey(null);
              }}
              availableVariables={getAvailableVariables(nodes, edges, node.id, templates)}
            />
          </div>
        )}

        {/* Advanced section */}
        <button
          onClick={() => setAdvanced(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between',
            color: '#52525b', fontSize: 11, cursor: 'pointer', padding: '4px 0',
            background: 'transparent', border: 'none', width: '100%', textAlign: 'left'
          }}
        >
          Advanced
          <ChevronDown size={12} style={{ transform: advanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {advanced && (
          <div className="fe-field">
            <label className="fe-label">Node ID</label>
            <input className="fe-input" value={node.id} readOnly style={{ color: '#52525b', cursor: 'default' }} />
          </div>
        )}

        {/* Delete */}
        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          <button
            onClick={() => onDelete(node.id)}
            className="fe-btn fe-btn-danger"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Trash2 size={13} /> Delete Node
          </button>
        </div>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
