"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkflow = exports.listWorkflows = void 0;
const express_1 = require("@clerk/express");
const workflow_service_1 = require("../services/workflow.service");
const database_service_1 = require("../services/database.service");
const listWorkflows = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { status, take, orderBy } = req.query;
        const filters = {};
        if (status)
            filters.status = status;
        if (take)
            filters.take = parseInt(take, 10);
        if (orderBy) {
            const [field, direction] = orderBy.split(':');
            if (field && direction) {
                filters.orderBy = { [field]: direction };
            }
        }
        const workflows = await workflow_service_1.workflowService.getWorkflowsByUser(user.id, filters);
        res.json(workflows);
    }
    catch (error) {
        next(error);
    }
};
exports.listWorkflows = listWorkflows;
const getWorkflow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { id } = req.params;
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const workflow = await workflow_service_1.workflowService.getWorkflowByIdAndUser(id, user.id);
        if (!workflow) {
            res.status(403).json({ error: 'Access denied or workflow not found' });
            return;
        }
        res.json(workflow);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkflow = getWorkflow;
