"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flowService = void 0;
const models_1 = require("../models");
const queue_service_1 = require("./queue.service");
function topologicalSort(nodes, edges) {
    const inDegree = {};
    const adjList = {};
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
    const sorted = [];
    while (queue.length > 0) {
        const current = queue.shift();
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
exports.flowService = {
    createFlow: async (data, userId) => {
        return await models_1.prisma.flow.create({
            data: {
                userId,
                name: data.name || 'Untitled Flow',
                description: data.description,
                nodes: data.nodes || [],
                edges: data.edges || [],
            },
        });
    },
    listFlows: async (userId) => {
        return await models_1.prisma.flow.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    },
    getFlow: async (id, userId) => {
        return await models_1.prisma.flow.findUnique({ where: { id, userId } });
    },
    updateFlow: async (id, data, userId) => {
        return await models_1.prisma.flow.update({
            where: { id, userId },
            data: {
                name: data.name,
                nodes: data.nodes,
                edges: data.edges,
            }
        });
    },
    deleteFlow: async (id, userId) => {
        return await models_1.prisma.flow.delete({ where: { id, userId } });
    },
    runFlow: async (id, userId) => {
        const flow = await models_1.prisma.flow.findUnique({ where: { id, userId } });
        if (!flow)
            throw new Error('Flow not found');
        const nodes = flow.nodes;
        const edges = flow.edges;
        const sorted = topologicalSort(nodes, edges);
        const workflow = await models_1.prisma.workflow.create({
            data: {
                userId: flow.userId,
                flowId: flow.id,
                name: flow.name,
                status: 'PENDING',
                nodes: {
                    create: sorted.map((node, index) => {
                        let nodeType = 'AGENT';
                        let agentType = node.type;
                        if (node.type === 'start') {
                            nodeType = 'START';
                            agentType = undefined;
                        }
                        else if (node.type === 'end') {
                            nodeType = 'END';
                            agentType = undefined;
                        }
                        let parsedPayload = {};
                        try {
                            parsedPayload = typeof node.data?.payload === 'string'
                                ? JSON.parse(node.data.payload)
                                : (node.data?.payload || {});
                        }
                        catch (e) {
                            parsedPayload = { _raw: node.data?.payload };
                        }
                        const incomingEdges = edges.filter((e) => e.target === node.id);
                        const dependsOnIndices = incomingEdges.map((e) => {
                            const sourceNodeIndex = sorted.findIndex((n) => n.id === e.source);
                            return String(sourceNodeIndex);
                        });
                        return {
                            stepIndex: index,
                            type: nodeType,
                            agentType: agentType,
                            config: { payload: parsedPayload },
                            positionX: node.position?.x,
                            positionY: node.position?.y,
                            status: 'PENDING',
                            dependsOn: dependsOnIndices,
                        };
                    }),
                },
            },
        });
        await queue_service_1.queueService.enqueueWorkflow(workflow.id);
        return workflow;
    }
};
