"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const v1_1 = __importDefault(require("./api/v1"));
const errorHandler_1 = require("./middleware/errorHandler");
const webhook_controller_1 = require("./controllers/webhook.controller");
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
// Webhook route must be before express.json()
app.post('/api/webhooks/clerk', express_1.default.raw({ type: 'application/json' }), webhook_controller_1.clerkWebhook);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Debug middleware to log auth header
app.use((req, res, next) => {
    if (req.path.startsWith('/api/v1')) {
        console.log(`[AUTH DEBUG] ${req.method} ${req.path}`);
        console.log(`[AUTH DEBUG] Headers:`, req.headers.authorization ? 'Bearer [HIDDEN]' : 'MISSING');
    }
    next();
});
// Routes
app.use('/api/v1', v1_1.default);
// Centralized Error Handling
app.use(errorHandler_1.errorHandler);
exports.default = app;
