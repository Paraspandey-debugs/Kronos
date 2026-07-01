"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchStep = dispatchStep;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});
// The queue where we send tasks to the worker (Engine B)
const taskQueue = new bullmq_1.Queue('task-queue', { connection: redis });
async function dispatchStep(step, resolvedInput) {
    await taskQueue.add('execute-task', {
        taskId: step.id,
        agentType: step.agentType || 'unknown',
        payload: resolvedInput,
    });
}
