"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const db_service_1 = require("./services/db.service");
const registry_1 = require("./handlers/registry");
const redis = new ioredis_1.default(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});
const worker = new bullmq_1.Worker('task-queue', async (job) => {
    console.log(`\nEngine B picked up job: ${job.id}`);
    const { taskId, agentType, payload } = job.data;
    await (0, db_service_1.updateTaskStatus)(taskId, 'RUNNING');
    try {
        const handler = registry_1.handlerRegistry[agentType];
        if (!handler) {
            throw new Error(`Unknown agentType: ${agentType}`);
        }
        const result = await handler(payload);
        await (0, db_service_1.updateTaskStatus)(taskId, 'COMPLETED', result);
        console.log(`Job ${job.id} finished successfully.`);
        const step = await db_service_1.prisma.workflowNode.findUnique({
            where: { id: taskId },
            select: { workflowId: true }
        });
        if (step?.workflowId) {
            const workflowQueue = new bullmq_1.Queue('workflow-queue', { connection: redis });
            await workflowQueue.add('continue-workflow', {
                workflowId: step.workflowId
            });
        }
        return result;
    }
    catch (error) {
        await (0, db_service_1.updateTaskStatus)(taskId, 'FAILED', null, error.message);
        console.error(`Job ${job.id} failed:`, error.message);
        throw error;
    }
}, { connection: redis, concurrency: 5 });
console.log('Engine B is running. Waiting for jobs...');
// Health check server for Render
const port = process.env.PORT || 8081;
const server = http_1.default.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'worker', timestamp: new Date().toISOString() }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});
server.listen(port, () => {
    console.log(`Worker health check listening on port ${port}`);
});
process.on('SIGTERM', async () => {
    await worker.close();
    await db_service_1.prisma.$disconnect();
    server.close();
    process.exit(0);
});
