# `models/index.ts`

## Overview
The `models/index.ts` file acts as the singleton provider for the Prisma ORM instance.

## Components
- Instantiates `new PrismaClient()`.
- Exports it as `prisma`. By using a singleton export, the gateway avoids spawning excessive database connections during active request bursts. All database service files import this single client.
