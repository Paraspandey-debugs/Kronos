"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowSchema = void 0;
const zod_1 = require("zod");
exports.createWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        nodes: zod_1.z.array(zod_1.z.object({
            type: zod_1.z.string(),
            agentType: zod_1.z.string().optional(),
            config: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
            positionX: zod_1.z.number().optional(),
            positionY: zod_1.z.number().optional()
        })).min(1, 'At least one node is required'),
    }),
});
