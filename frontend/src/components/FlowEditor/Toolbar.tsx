import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLayout: () => void;
  onSave: () => void;
  onRun: () => void;
}

export const Toolbar: React.FC<Props> = ({ onLayout, onSave, onRun }) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.1)] bg-[#111111] flex items-center justify-between px-4 shrink-0 w-full z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/flows')}
          className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Flows
        </button>
        <div className="h-4 w-px bg-neutral-700"></div>
        <h1 className="text-white font-medium">Workflow Editor</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onLayout}
          className="px-3 py-1.5 text-sm rounded bg-[#1a1a1a] hover:bg-[#222222] border border-[rgba(255,255,255,0.1)] text-white transition-colors"
        >
          Auto Layout
        </button>
        <button 
          onClick={onSave}
          className="px-4 py-1.5 text-sm rounded bg-[#1a1a1a] hover:bg-[#222222] border border-[rgba(255,255,255,0.1)] text-white transition-colors"
        >
          Save Flow
        </button>
        <button 
          onClick={onRun}
          className="px-4 py-1.5 text-sm rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Deploy Flow
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
