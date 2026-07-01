"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuthMiddleware = exports.authMiddleware = void 0;
const express_1 = require("@clerk/express");
exports.authMiddleware = (0, express_1.clerkMiddleware)();
exports.requireAuthMiddleware = (0, express_1.requireAuth)();
