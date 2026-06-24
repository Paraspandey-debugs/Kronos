# `test-db.js`

## Overview
The `test-db.js` file is a utility script used to test database connectivity and verify data retrieval operations. It utilizes the Prisma client to query the PostgreSQL database.

## Components
1. **Database Client (`prisma`)**:
   - Initializes a new `PrismaClient` to interact with the database.

2. **`main` Function**:
   - Queries the `workflow` table to find the most recently created workflow (`orderBy: { createdAt: 'desc' }`).
   - Retrieves the first record (`take: 1`) along with its associated steps (`include: { steps: true }`).
   - Outputs the result to the console in a detailed format using `console.dir` with `depth: null`.

3. **Execution & Cleanup**:
   - Invokes the `main` function.
   - Catches and logs any errors.
   - Ensures the Prisma client disconnects properly upon completion via the `.finally()` block.
