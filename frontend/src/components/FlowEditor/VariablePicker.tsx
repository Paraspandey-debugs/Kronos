import React from 'react';
import { Box, X, Database } from 'lucide-react';

interface VariablePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  availableVariables: Array<{
    nodeId: string;
    nodeName: string;
    stepIndex: number;
    outputs: Array<{ path: string; type: string }>;
  }>;
}

export const VariablePicker: React.FC<VariablePickerProps> = ({ isOpen, onClose, onSelect, availableVariables }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#0a0a0a]">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Database size={16} className="text-indigo-400" />
            Insert Variable
          </h3>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {availableVariables.length === 0 ? (
            <div className="text-center p-6 text-neutral-500 text-sm border border-dashed border-neutral-800 rounded-lg">
              No upstream nodes found.<br/>Connect this node to previous steps first.
            </div>
          ) : (
            availableVariables.map((node) => (
              <div key={node.nodeId} className="border border-neutral-800/50 rounded-lg bg-[#050505] overflow-hidden">
                <div className="bg-neutral-900/50 px-3 py-2 text-xs font-semibold text-indigo-300 border-b border-neutral-800/50 flex justify-between">
                  <span>{node.nodeName}</span>
                  <span className="text-neutral-500 font-normal">Step {node.stepIndex}</span>
                </div>
                <div className="p-2 space-y-1">
                  {node.outputs.length === 0 ? (
                    <div className="text-xs text-neutral-600 italic px-2 py-1">No outputs defined</div>
                  ) : (
                    node.outputs.map((output) => (
                      <button
                        key={output.path}
                        onClick={() => {
                          onSelect(`$step_${node.stepIndex}.${output.path}`);
                          onClose();
                        }}
                        className="w-full text-left flex items-center justify-between text-sm hover:bg-indigo-950/30 p-2 rounded transition-colors group"
                      >
                        <span className="text-neutral-300 flex items-center gap-2">
                          <Box size={14} className="text-neutral-500 group-hover:text-indigo-400" />
                          {output.path}
                        </span>
                        <span className="text-[10px] text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">
                          {output.type}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
