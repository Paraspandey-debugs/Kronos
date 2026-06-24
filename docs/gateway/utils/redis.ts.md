# `utils/redis.ts`

## Overview
Initializes the global connection to the Redis cache/queue broker.

## Source Code & Implementation
```typescript
import Redis from 'ioredis';
import { config } from '../config';

const redisUrl = config.REDIS_URL || 'redis://localhost:6379';
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});
```

## Key Mechanisms
- Configures `ioredis` to connect to Upstash/Neon/Local Redis.
- Explicitly sets `maxRetriesPerRequest: null`, which is a strict requirement for BullMQ workers.
