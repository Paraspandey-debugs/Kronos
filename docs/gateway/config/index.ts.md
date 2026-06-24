# `config/index.ts`

## Overview
The `config/index.ts` module uses Zod to validate and cleanly export environment variables for the entire application. This guarantees that the Gateway cannot boot up if crucial configuration values are missing or malformed.

## Components
- **`envSchema`**: A Zod schema validating:
  - `PORT`: (Default: `3000`)
  - `NODE_ENV`: (Default: `development`)
  - `DATABASE_URL`: Connection string for PostgreSQL (Prisma).
  - `REDIS_URL`: Connection string for Redis (BullMQ).
  - `JWT_SECRET`: Secret used for future auth logic.
- **`config` Export**: An immutable object representing the strongly-typed environment variables, accessible from anywhere in the app.
