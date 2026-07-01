"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http = __importStar(require("http"));
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const execution_service_1 = require("./services/execution.service");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});
// This Engine listens for "workflow-queue" events
const orchestrator = new bullmq_1.Worker('workflow-queue', // Queue name for workflow orchestration
async (job) => {
    console.log(`\nEngine A (Orchestrator) picked up: ${job.name} - ${job.id}`);
    if (job.name === 'run-workflow' || job.name === 'process-workflow') {
        const { workflowId } = job.data;
        await (0, execution_service_1.startWorkflow)(workflowId);
    }
    else if (job.name === 'continue-workflow') {
        const { workflowId } = job.data;
        await (0, execution_service_1.checkAndTriggerNextSteps)(workflowId);
    }
}, { connection: redis });
console.log('Engine A (Orchestrator) is running. Waiting for workflows...');
// Health check server for Render
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'orchestrator', timestamp: new Date().toISOString() }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});
server.listen(port, () => {
    console.log(`Orchestrator health check listening on port ${port}`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    await orchestrator.close();
    await prisma.$disconnect();
    server.close();
    process.exit(0);
});
