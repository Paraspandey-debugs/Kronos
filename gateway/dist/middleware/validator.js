"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Extract raw issues array from v4 or v3
                const rawIssues = error.issues || error.errors || [];
                // Clean and flatten the issues to prevent massive JSON payloads
                const cleanErrors = rawIssues.map((issue) => ({
                    path: issue.path?.join('.') || 'unknown',
                    message: issue.message,
                    code: issue.code
                }));
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: cleanErrors.length > 0 ? cleanErrors : 'Invalid payload',
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
