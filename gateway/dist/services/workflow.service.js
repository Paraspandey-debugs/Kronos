"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowService = void 0;
const database_service_1 = require("./database.service");
exports.workflowService = {
    getWorkflowsByUser: async (userId, filters) => {
        return await database_service_1.databaseService.getWorkflowsByUser(userId, filters);
    },
    getWorkflowByIdAndUser: async (id, userId) => {
        const workflow = await database_service_1.databaseService.getWorkflowById(id);
        if (!workflow || workflow.userId !== userId) {
            return null; // or throw a specific error
        }
        return workflow;
    }
};
