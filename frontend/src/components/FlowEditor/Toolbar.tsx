import React from 'react';
import { Save, Play, LayoutGrid } from 'lucide-react';

interface Props {
  onLayout: () => void;
  onSave: () => void;
  onRun: () => void;
}

export const Toolbar: React.FC<Props> = ({ onLayout, onSave, onRun }) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button 
        onClick={onLayout}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <LayoutGrid size={16} />
        Auto Layout
      </button>
      <button 
        onClick={onSave}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
      >
        <Save size={16} />
        Save Flow
      </button>
      <button 
        onClick={onRun}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700"
      >
        <Play size={16} />
        Run Flow
      </button>
    </div>
  );
};

export default Toolbar;
