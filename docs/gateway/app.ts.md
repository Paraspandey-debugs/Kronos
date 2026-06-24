# `app.ts`

## Overview
The `app.ts` file acts as the central configuration hub for the Express application. It is responsible for assembling all middleware, setting up global routing prefixes, and implementing overarching error handling.

## Components
1. **Security & Utility Middleware**: 
   - `helmet`: Protects the app from well-known web vulnerabilities by setting HTTP headers.
   - `cors`: Allows Cross-Origin Resource Sharing for frontend interfaces.
   - `express.json` / `express.urlencoded`: Parses incoming JSON and URL-encoded payloads.
   - `morgan`: Provides HTTP request logging in development.

2. **Routes Assembly**: 
   - Mounts the `v1Routes` (from `api/v1`) to the `/api/v1` path prefix.

3. **Error Handling**:
   - The global `errorHandler` middleware is mounted last to catch any exceptions thrown by controllers or services.
