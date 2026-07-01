"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = void 0;
const models_1 = require("../models");
exports.databaseService = {
    getWorkflowById: async (id) => {
        return await models_1.prisma.workflow.findUnique({
            where: { id },
            include: { nodes: true }
        });
    },
    getWorkflowsByUser: async (userId, filters) => {
        const { status, take, orderBy } = filters || {};
        return await models_1.prisma.workflow.findMany({
            where: {
                userId,
                ...(status ? { status } : {})
            },
            include: { nodes: true },
            orderBy: orderBy || { createdAt: 'desc' },
            ...(take ? { take } : {})
        });
    },
    getUserByClerkId: async (clerkId) => {
        return await models_1.prisma.user.findUnique({ where: { clerkId } });
    },
    upsertUser: async (data) => {
        return await models_1.prisma.user.upsert({
            where: { clerkId: data.clerkId },
            update: { email: data.email },
            create: { clerkId: data.clerkId, email: data.email },
        });
    },
    deleteUser: async (clerkId) => {
        return await models_1.prisma.user.delete({ where: { clerkId } });
    }
};
