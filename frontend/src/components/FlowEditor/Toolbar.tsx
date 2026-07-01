import React, { useState } from 'react';
import { ArrowLeft, Layout, Save, Play, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  flowName: string;
  onFlowNameChange: (name: string) => void;
  onLayout: () => void;
  onSave: () => void;
  onRun: () => void;
  isSaving?: boolean;
  isRunning?: boolean;
  saveSuccess?: boolean;
}

export const Toolbar: React.FC<Props> = ({
  flowName, onFlowNameChange,
  onLayout, onSave, onRun,
  isSaving, isRunning, saveSuccess,
}) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  return (
    <header className="fe-toolbar">
      <div className="fe-toolbar-left">
        <button className="fe-btn" onClick={() => navigate('/flows')}>
          <ArrowLeft size={14} /> Back
        </button>

        <div className="fe-divider" />

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#71717a' }}>
          <span style={{ cursor: 'pointer', color: '#a1a1aa' }} onClick={() => navigate('/flows')}>Flows</span>
          <ChevronRight size={12} />
          <input
            className="fe-flow-name"
            value={flowName}
            onChange={e => onFlowNameChange(e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            style={{ color: editing ? '#fff' : '#e4e4e7' }}
            spellCheck={false}
          />
        </div>

        {saveSuccess && (
          <span className="fe-saving-pill" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={10} /> Saved
          </span>
        )}
      </div>

      <div className="fe-toolbar-right">
        <button className="fe-btn" onClick={onLayout} title="Auto-arrange nodes">
          <Layout size={14} /> Auto Layout
        </button>

        <button
          className="fe-btn"
          onClick={onSave}
          disabled={isSaving}
          title="Save (Ctrl+S)"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>

        <button
          className="fe-btn fe-btn-success"
          onClick={onRun}
          disabled={isRunning}
          title="Deploy and run this flow"
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Deploy
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
