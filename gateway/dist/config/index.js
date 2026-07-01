"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.string().default('development'),
    DATABASE_URL: zod_1.z.string().optional(), // Make optional if not set yet
    REDIS_URL: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().default('secret'),
});
exports.config = envSchema.parse(process.env);
