"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../../controllers/agent.controller");
const router = (0, express_1.Router)();
router.get('/templates', agent_controller_1.getAgentTemplates);
exports.default = router;
