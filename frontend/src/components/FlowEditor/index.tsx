import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import type { Connection, Edge, Node, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './FlowEditor.css';

import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import { useAutoLayout } from './hooks/useAutoLayout';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchAgentTemplates } from '../../lib/api';
import Sidebar from './Sidebar';

const initialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Start', payload: JSON.stringify({ target: "https://github.com" }, null, 2) },
  }
];

interface FlowEditorProps {
  initialData?: { nodes: Node[], edges: Edge[] };
  onSaveFlow?: (nodes: Node[], edges: Edge[]) => void;
  onRunFlow?: () => void;
}

const FlowEditorInner: React.FC<FlowEditorProps> = ({ initialData, onSaveFlow, onRunFlow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { layout } = useAutoLayout();
  const { getToken } = useAuth();

  const { data: templates = [] } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: async () => {
      const token = await getToken();
      return fetchAgentTemplates(token || '');
    }
  });

  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
    }
  }, [initialData, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const deletedIds = new Set(deleted.map((n) => n.id));
      setEdges((eds) => eds.filter((e) => 
        !deletedIds.has(e.source) && !deletedIds.has(e.target)
      ));
      if (selectedNode && deletedIds.has(selectedNode.id)) {
        setSelectedNode(null);
      }
    },
    [setEdges, selectedNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const template = templates.find((t: any) => t.type === type);

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: template?.label || type.charAt(0).toUpperCase() + type.slice(1),
          payload: template ? JSON.stringify(template.defaultPayload, null, 2) : "{}"
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;

      const template = templates.find((t: any) => t.type === 'scout');

      const newNode: Node = {
        id: `scout-${Date.now()}`,
        type: 'scout',
        position: { x: midX, y: midY },
        data: { 
          label: template?.label || 'Inserted Step', 
          payload: template ? JSON.stringify(template.defaultPayload, null, 2) : "{}" 
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) => {
        const withoutOld = eds.filter((e) => e.id !== edge.id);
        return [
          ...withoutOld,
          { id: `e1-${Date.now()}`, source: edge.source, target: newNode.id },
          { id: `e2-${Date.now()}`, source: newNode.id, target: edge.target },
        ];
      });
    },
    [nodes, setNodes, setEdges]
  );

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [setNodes, setEdges, selectedNode]);

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] font-sans text-white overflow-hidden">
      <Toolbar 
        onLayout={() => layout(nodes, edges, setNodes, setEdges)}
        onSave={() => onSaveFlow?.(nodes, edges)}
        onRun={() => onRunFlow?.()}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar templates={templates} />
        
        <section className="flex-1 relative overflow-hidden bg-[#050505]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodesDelete={onNodesDelete}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes as NodeTypes}
          edgeTypes={edgeTypes}
          fitView
          snapToGrid
          snapGrid={[15, 15]}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
          <Controls className="!bg-[#0a0a0a] !border-neutral-800 !fill-neutral-400" />
        </ReactFlow>
      </section>

      <PropertiesPanel 
          node={selectedNode} 
          nodes={nodes}
          edges={edges}
          templates={templates}
          onUpdate={(updated) => {
            setNodes((nds) => nds.map((n) => n.id === updated.id ? updated : n));
            if (selectedNode?.id === updated.id) {
              setSelectedNode(updated);
            }
          }} 
          onDelete={handleNodeDelete}
        />
      </main>
    </div>
  );
};

export const FlowEditor: React.FC<FlowEditorProps> = (props) => (
  <ReactFlowProvider>
    <FlowEditorInner {...props} />
  </ReactFlowProvider>
);

export default FlowEditor;
