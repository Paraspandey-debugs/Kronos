import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().optional(), // Make optional if not set yet
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().default('secret'),
});

export const config = envSchema.parse(process.env);
