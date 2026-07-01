"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_routes_1 = __importDefault(require("./health.routes"));
const workflows_routes_1 = __importDefault(require("./workflows.routes"));
const flows_routes_1 = __importDefault(require("./flows.routes"));
const agents_routes_1 = __importDefault(require("./agents.routes"));
const clerk_1 = require("../../middleware/clerk");
const router = (0, express_1.Router)();
router.use('/health', health_routes_1.default);
router.use('/workflows', clerk_1.authMiddleware, workflows_routes_1.default);
router.use('/flows', clerk_1.authMiddleware, flows_routes_1.default);
router.use('/agents', clerk_1.authMiddleware, agents_routes_1.default);
exports.default = router;
