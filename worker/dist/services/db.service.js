"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.updateTaskStatus = updateTaskStatus;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
exports.prisma = new client_1.PrismaClient({ adapter });
async function updateTaskStatus(id, status, result, error) {
    return exports.prisma.workflowNode.update({
        where: { id },
        data: {
            status,
            result: result || undefined,
            error: error || undefined,
            completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date() : undefined,
        },
    });
}
