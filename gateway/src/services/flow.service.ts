import { prisma } from '../models';
import { queueService } from './queue.service';

function topologicalSort(nodes: any[], edges: any[]) {
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
  const sorted: any[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (node && node.type !== 'start' && node.type !== 'end') {
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

export const flowService = {
  createFlow: async (data: any, userId: string) => {
    return await prisma.flow.create({
      data: {
        userId,
        name: data.name || 'Untitled Flow',
        description: data.description,
        nodes: data.nodes || [],
        edges: data.edges || [],
      },
    });
  },

  listFlows: async (userId: string) => {
    return await prisma.flow.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  getFlow: async (id: string, userId: string) => {
    return await prisma.flow.findUnique({ where: { id, userId } });
  },
  
  updateFlow: async (id: string, data: any, userId: string) => {
    return await prisma.flow.update({
      where: { id, userId },
      data: {
        name: data.name,
        nodes: data.nodes,
        edges: data.edges,
      }
    });
  },

  deleteFlow: async (id: string, userId: string) => {
    return await prisma.flow.delete({ where: { id, userId } });
  },

  runFlow: async (id: string, userId: string) => {
    const flow = await prisma.flow.findUnique({ where: { id, userId } });
    if (!flow) throw new Error('Flow not found');

    const nodes = flow.nodes as any[];
    const edges = flow.edges as any[];

    const sorted = topologicalSort(nodes, edges);
    
    const workflow = await prisma.workflow.create({
      data: {
        userId: flow.userId,
        flowId: flow.id,
        status: 'PENDING',
        steps: {
          create: sorted.map((node, index) => ({
            stepIndex: index,
            agentType: node.type,
            payload: node.data?.payload || {},
            status: 'PENDING',
          })),
        },
      },
    });

    await queueService.enqueueWorkflow(workflow.id);
    return workflow;
  }
};
