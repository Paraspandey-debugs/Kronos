"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueService = exports.workflowQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../utils/redis");
exports.workflowQueue = new bullmq_1.Queue('workflow-queue', { connection: redis_1.redisClient });
exports.queueService = {
    enqueueWorkflow: async (workflowId) => {
        return await exports.workflowQueue.add('process-workflow', { workflowId }, {
            jobId: workflowId, // Ensure no duplicates
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
        });
    }
};
