import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlowEditor.css';

import { edgeTypes } from './edges';
import { DynamicNode } from './nodes';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import { useAutoLayout } from './hooks/useAutoLayout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchAgentTemplates } from '../../lib/api';
import Sidebar from './Sidebar';
import * as LucideIcons from 'lucide-react';

const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.3)', width: 16, height: 16 },
  style: { strokeWidth: 2 },
};

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 120, y: 200 },
    data: { label: 'Start', payload: JSON.stringify({ target: 'https://example.com' }, null, 2) },
  },
];

interface FlowEditorProps {
  flowId?: string;
  initialData?: { nodes: Node[]; edges: Edge[]; name?: string };
  onSaveFlow?: (nodes: Node[], edges: Edge[], name: string) => void;
  onRunFlow?: () => void;
  isSaving?: boolean;
  isRunning?: boolean;
  saveSuccess?: boolean;
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

const NodePicker: React.FC<{
  pos: { x: number; y: number };
  templates: any[];
  onSelect: (type: string) => void;
  onClose: () => void;
}> = ({ pos, templates, onSelect, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const colorMap: Record<string, { bg: string; fg: string }> = {
    'n-green':  { bg: 'rgba(34,197,94,0.12)',  fg: '#22c55e' },
    'n-blue':   { bg: 'rgba(59,130,246,0.12)', fg: '#3b82f6' },
    'n-amber':  { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
    'n-purple': { bg: 'rgba(168,85,247,0.12)', fg: '#a855f7' },
    'n-rose':   { bg: 'rgba(244,63,94,0.12)',  fg: '#f43f5e' },
    'n-teal':   { bg: 'rgba(20,184,166,0.12)', fg: '#14b8a6' },
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: pos.x, top: pos.y,
        zIndex: 1000,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 6,
        minWidth: 180,
        boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 10, color: '#52525b', padding: '2px 6px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Add node
      </div>
      {templates.map(({ type, label, icon, color }) => {
        const iconName = icon || (type === 'start' ? 'Play' : type === 'end' ? 'Flag' : type === 'decision' ? 'Zap' : 'Box');
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
        const resolvedColor = color || getColorForType(type);
        const c = colorMap[resolvedColor] || colorMap['n-blue'];
        
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', border: 'none', width: '100%',
              textAlign: 'left', transition: 'background 0.12s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 26, height: 26, borderRadius: 6, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={13} color={c.fg} />
            </div>
            <span style={{ fontSize: 12.5, color: '#e4e4e7', fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

const FlowEditorInner: React.FC<FlowEditorProps> = ({
  initialData, onSaveFlow, onRunFlow,
  isSaving, isRunning, saveSuccess,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState(initialData?.name || 'Untitled Flow');
  const [picker, setPicker] = useState<{ screen: { x: number; y: number }; flow: { x: number; y: number } } | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { layout } = useAutoLayout();
  const { getToken } = useAuth();

  const { data: templates = [] } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      const token = await getToken();
      return fetchAgentTemplates(token || '');
    },
  });

  const nodeTypes = React.useMemo(() => {
    const types: Record<string, React.ElementType> = {};
    templates.forEach((t: any) => {
      types[t.type] = DynamicNode;
    });
    if (!types.start) types.start = DynamicNode;
    if (!types.end) types.end = DynamicNode;
    return types;
  }, [templates]);

  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
      if (initialData.name) setFlowName(initialData.name);
    }
  }, [initialData, setNodes, setEdges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSaveFlow?.(nodes, edges, flowName);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nodes, edges, flowName, onSaveFlow]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds => addEdge({ ...params, ...DEFAULT_EDGE_OPTIONS }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setPicker(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setPicker(null);
  }, []);

  const onPaneDoubleClick = useCallback((e: React.MouseEvent) => {
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setPicker({ screen: { x: e.clientX, y: e.clientY }, flow: flowPos });
  }, [screenToFlowPosition]);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const ids = new Set(deleted.map(n => n.id));
      setEdges(eds => eds.filter(e => !ids.has(e.source) && !ids.has(e.target)));
      if (selectedNode && ids.has(selectedNode.id)) setSelectedNode(null);
    },
    [setEdges, selectedNode]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('application/reactflow');
      if (!type) return;
      addNodeAtPosition(type, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [screenToFlowPosition, templates]
  );

  const addNodeAtPosition = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const template = templates.find((t: any) => t.type === type);
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: template?.label || type,
          payload: template ? JSON.stringify(template.defaultPayload, null, 2) : '{}',
        },
      };
      setNodes(nds => nds.concat(newNode));
      setSelectedNode(newNode);
    },
    [templates, setNodes]
  );

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  }, [setNodes, setEdges, selectedNode]);

  const handleUpdate = useCallback((updated: Node) => {
    setNodes(nds => nds.map(n => n.id === updated.id ? updated : n));
    if (selectedNode?.id === updated.id) setSelectedNode(updated);
  }, [setNodes, selectedNode]);

  const selectedFromNodes = selectedNode ? nodes.find(n => n.id === selectedNode.id) || null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', background: '#101010', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden' }}>
      <Toolbar
        flowName={flowName}
        onFlowNameChange={setFlowName}
        onLayout={() => layout(nodes, edges, setNodes, setEdges)}
        onSave={() => onSaveFlow?.(nodes, edges, flowName)}
        onRun={() => onRunFlow?.()}
        isSaving={isSaving}
        isRunning={isRunning}
        saveSuccess={saveSuccess}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar templates={templates} />

        <div style={{ flex: 1, position: 'relative' }}>
          {nodes.length <= 1 && (
            <div className="canvas-hint">
              <div className="canvas-hint-icon">⚡</div>
              <p>Double-click the canvas to add a node</p>
              <p>or drag from the left panel</p>
            </div>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onPaneDoubleClick={onPaneDoubleClick as any}
            onNodesDelete={onNodesDelete}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes as NodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            snapToGrid
            snapGrid={[20, 20]}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Shift"
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color="rgba(255,255,255,0.08)"
            />
            <Controls position="bottom-left" />
            <MiniMap
              nodeColor={n => {
                const template = templates.find((t: any) => t.type === n.type);
                const metaColor = template?.color || getColorForType(n.type);
                const colorMap: Record<string, string> = {
                  'n-green': '#22c55e', 'n-blue': '#3b82f6', 'n-amber': '#f59e0b',
                  'n-purple': '#a855f7', 'n-rose': '#f43f5e', 'n-teal': '#14b8a6',
                };
                return colorMap[metaColor] || '#6366f1';
              }}
              maskColor="rgba(0,0,0,0.6)"
              position="bottom-right"
              style={{ bottom: 16, right: 16 }}
            />
          </ReactFlow>

          {picker && (
            <NodePicker
              pos={picker.screen}
              templates={templates}
              onSelect={type => {
                addNodeAtPosition(type, picker.flow);
                setPicker(null);
              }}
              onClose={() => setPicker(null)}
            />
          )}
        </div>

        {selectedFromNodes && (
          <PropertiesPanel
            node={selectedFromNodes}
            nodes={nodes}
            edges={edges}
            templates={templates}
            onUpdate={handleUpdate}
            onDelete={handleNodeDelete}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export const FlowEditor: React.FC<FlowEditorProps> = (props) => (
  <ReactFlowProvider>
    <FlowEditorInner {...props} />
  </ReactFlowProvider>
);

export default FlowEditor;
