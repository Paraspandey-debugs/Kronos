import type { Node, Edge } from '@xyflow/react';

export function topologicalSort(nodes: Node[], edges: Edge[]) {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  nodes.forEach(n => {
    inDegree[n.id] = 0;
    adjList[n.id] = [];
  });

  edges.forEach(e => {
    if (adjList[e.source]) {
      adjList[e.source].push(e.target);
    }
    if (inDegree[e.target] !== undefined) {
      inDegree[e.target]++;
    }
  });

  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  const sorted: Node[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (node) {
      sorted.push(node);
    }
    
    (adjList[current] || []).forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  return sorted;
}

export function findAncestors(nodes: Node[], edges: Edge[], currentNodeId: string): Node[] {
  const adjList: Record<string, string[]> = {};
  
  // Build reverse adjacency list (target -> source)
  nodes.forEach(n => { adjList[n.id] = []; });
  edges.forEach(e => {
    if (adjList[e.target]) {
      adjList[e.target].push(e.source);
    }
  });

  const ancestors = new Set<string>();
  const queue = [currentNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const parents = adjList[current] || [];
    parents.forEach(p => {
      if (!ancestors.has(p)) {
        ancestors.add(p);
        queue.push(p);
      }
    });
  }

  return nodes.filter(n => ancestors.has(n.id));
}

export function flattenOutputSchema(schema: any, prefix = ''): { path: string, type: string }[] {
  if (!schema || !schema.properties) return [];
  
  const result: { path: string, type: string }[] = [];
  for (const [key, prop] of Object.entries<any>(schema.properties)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (prop.type === 'object' && prop.properties) {
      result.push(...flattenOutputSchema(prop, path));
    } else {
      result.push({ path, type: prop.type || 'any' });
    }
  }
  return result;
}

export function getAvailableVariables(nodes: Node[], edges: Edge[], currentNodeId: string, templates: any[]) {
  const sortedNodes = topologicalSort(nodes, edges);
  
  // Assign step indices based on topological sort
  const nodeIndices = new Map(sortedNodes.map((n, i) => [n.id, i]));
  
  const ancestors = findAncestors(nodes, edges, currentNodeId);
  
  // Sort ancestors by step index so they appear in logical order
  ancestors.sort((a, b) => (nodeIndices.get(a.id) || 0) - (nodeIndices.get(b.id) || 0));

  return ancestors.map(node => {
    const template = templates.find(t => t.type === node.type);
    let outputs = flattenOutputSchema(template?.outputSchema);
    
    // Fallback: If it's a start node (or any node with empty outputSchema), extract keys from payload
    if (outputs.length === 0 && node.data?.payload) {
      try {
        const payloadObj = typeof node.data.payload === 'string' 
          ? JSON.parse(node.data.payload) 
          : node.data.payload;
        
        if (typeof payloadObj === 'object' && payloadObj !== null) {
          outputs = Object.keys(payloadObj).map(key => ({
            path: key,
            type: typeof payloadObj[key]
          }));
        }
      } catch (e) {}
    }
    
    return {
      nodeId: node.id,
      nodeName: (node.data?.label as string) || node.type || 'Unknown',
      stepIndex: nodeIndices.get(node.id) || 0,
      outputs: outputs
    };
  });
}
