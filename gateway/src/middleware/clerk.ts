import { clerkMiddleware, requireAuth } from '@clerk/express';

export const authMiddleware = clerkMiddleware();
export const requireAuthMiddleware = requireAuth();
