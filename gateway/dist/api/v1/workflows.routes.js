"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workflow_controller_1 = require("../../controllers/workflow.controller");
const clerk_1 = require("../../middleware/clerk");
const router = (0, express_1.Router)();
router.get('/', clerk_1.requireAuthMiddleware, workflow_controller_1.listWorkflows);
router.get('/:id', clerk_1.requireAuthMiddleware, workflow_controller_1.getWorkflow);
exports.default = router;
