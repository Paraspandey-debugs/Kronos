"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentTemplates = void 0;
const models_1 = require("../models");
const getAgentTemplates = async (req, res, next) => {
    try {
        const templates = await models_1.prisma.agentTemplate.findMany();
        res.json(templates);
    }
    catch (error) {
        next(error);
    }
};
exports.getAgentTemplates = getAgentTemplates;
