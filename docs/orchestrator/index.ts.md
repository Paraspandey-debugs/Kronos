# `index.ts`

## Overview
The `index.ts` file acts as the primary entry point for the Orchestrator (Engine A). It is responsible for orchestrating distributed workflows by listening to a Redis-backed queue (via BullMQ), tracking workflow state in PostgreSQL (via Prisma), and pushing individual executable tasks to the Worker queue (Engine B). 

## Components
1. **Database & Redis Clients**:
   - `prisma`: A PrismaClient instance for interacting with the PostgreSQL database.
   - `redis`: An IORedis instance configured to connect to the central Redis server, acting as the backing store for BullMQ queues.

2. **Orchestrator Worker (`orchestrator`)**:
   - Listens on the `workflow-queue` for `continue-workflow` or `process-workflow` jobs.
   - Triggers the `processWorkflow` function with the provided `workflowId`.

3. **`processWorkflow` Function**:
   - Fetches the current workflow and its associated steps from the database.
   - Identifies the next `PENDING` step in the sequence.
   - If no pending steps remain, it marks the entire workflow as `COMPLETED`.
   - If a pending step exists, it dispatches the task to the `task-queue` for Engine B to process and updates the step's status to `RUNNING`.
   - Includes robust error handling to transition the workflow to a `FAILED` state if an exception occurs.

4. **Graceful Shutdown**:
   - Intercepts the `SIGTERM` signal to securely close the BullMQ worker and Prisma database connection before exiting the process.
