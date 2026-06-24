# `server.ts`

## Overview
The `server.ts` file is the primary entry point for the Node.js application. While `app.ts` configures the Express application, `server.ts` actually binds it to the network port and handles process-level events.

## Components
1. **Server Initialization**: 
   - Calls `app.listen(PORT)` where `PORT` is derived securely from the validated environment configuration (`src/config/index.ts`).
2. **Process Management**:
   - Implements a global listener for `unhandledRejection` to gracefully log errors and shut down the Node process if an asynchronous operation fails violently, preventing memory leaks or zombie processes.
