# `controllers/health.controller.ts`

## Overview
Handles the incoming HTTP request logic for the healthcheck ping.

## Components
- **`healthCheck`**: Simply returns an HTTP 200 with `{ status: 'ok', timestamp: "..." }`. Useful for load balancers, container orchestration probes, and simple uptime monitoring.
