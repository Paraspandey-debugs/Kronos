import Redis from 'ioredis';
import { config } from '../config';

const redisUrl = config.REDIS_URL || 'redis://localhost:6379';
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});
