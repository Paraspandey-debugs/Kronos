import { useCallback, useState } from 'react';
import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 60;

export const useAutoLayout = () => {
  const [isLayouting, setIsLayouting] = useState(false);
  const layout = useCallback((
    nodes: Node[],
    edges: Edge[],
    setNodes: (nodes: Node[]) => void,
    setEdges: (edges: Edge[]) => void,
    direction: 'TB' | 'LR' = 'TB'
  ) => {
    setIsLayouting(true);
    dagreGraph.setGraph({ rankdir: direction });
    dagreGraph.nodes().forEach((id) => dagreGraph.removeNode(id));
    dagreGraph.edges().forEach((e) => dagreGraph.removeEdge(e.v, e.w, e.name));

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const newNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    setNodes(newNodes);
    setIsLayouting(false);
  }, []);

  return { layout, isLayouting };
};
