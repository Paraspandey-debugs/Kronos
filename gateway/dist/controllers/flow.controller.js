"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFlow = exports.deleteFlow = exports.updateFlow = exports.getFlow = exports.listFlows = exports.createFlow = void 0;
const express_1 = require("@clerk/express");
const flow_service_1 = require("../services/flow.service");
const database_service_1 = require("../services/database.service");
const createFlow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const flow = await flow_service_1.flowService.createFlow(req.body, user.id);
        res.status(201).json(flow);
    }
    catch (error) {
        next(error);
    }
};
exports.createFlow = createFlow;
const listFlows = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const flows = await flow_service_1.flowService.listFlows(user.id);
        res.json(flows);
    }
    catch (error) {
        next(error);
    }
};
exports.listFlows = listFlows;
const getFlow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const flow = await flow_service_1.flowService.getFlow(req.params.id, user.id);
        if (!flow)
            return res.status(404).json({ error: 'Flow not found' });
        res.json(flow);
    }
    catch (error) {
        next(error);
    }
};
exports.getFlow = getFlow;
const updateFlow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const flow = await flow_service_1.flowService.updateFlow(req.params.id, req.body, user.id);
        res.json(flow);
    }
    catch (error) {
        next(error);
    }
};
exports.updateFlow = updateFlow;
const deleteFlow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        await flow_service_1.flowService.deleteFlow(req.params.id, user.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFlow = deleteFlow;
const runFlow = async (req, res, next) => {
    try {
        const clerkId = (0, express_1.getAuth)(req).userId;
        if (!clerkId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await database_service_1.databaseService.getUserByClerkId(clerkId);
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const workflow = await flow_service_1.flowService.runFlow(req.params.id, user.id);
        res.status(202).json({ workflowId: workflow.id, status: workflow.status, message: 'Flow queued for execution' });
    }
    catch (error) {
        next(error);
    }
};
exports.runFlow = runFlow;
