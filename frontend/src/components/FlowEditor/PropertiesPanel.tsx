import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';

interface Props {
  node: Node | null;
  onUpdate: (node: Node) => void;
}

export const PropertiesPanel: React.FC<Props> = ({ node, onUpdate }) => {
  const [payload, setPayload] = useState('');

  useEffect(() => {
    if (node?.data?.payload) {
      setPayload(JSON.stringify(node.data.payload, null, 2));
    } else {
      setPayload('');
    }
  }, [node]);

  if (!node) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 text-black">
        <p className="text-sm text-gray-400">Select a node to configure</p>
      </div>
    );
  }

  const handlePayloadChange = (value: string) => {
    setPayload(value);
    try {
      const parsed = JSON.parse(value);
      onUpdate({
        ...node,
        data: { ...node.data, payload: parsed },
      });
    } catch {
      // Invalid JSON – don't update node data
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto text-black">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Node Properties
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            ID
          </label>
          <input
            type="text"
            value={node.id}
            disabled
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Type
          </label>
          <input
            type="text"
            value={node.type || 'default'}
            disabled
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Label
          </label>
          <input
            type="text"
            value={node.data?.label as string || ''}
            onChange={(e) => onUpdate({
              ...node,
              data: { ...node.data, label: e.target.value },
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-blue-400 outline-none"
          />
        </div>

        {(node.type === 'scout' || node.type === 'compressor') && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Payload (JSON)
            </label>
            <textarea
              value={payload}
              onChange={(e) => handlePayloadChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono focus:border-blue-400 outline-none resize-y"
              placeholder='{"target": "example.com"}'
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter valid JSON. Use $step_X.field to reference previous steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
