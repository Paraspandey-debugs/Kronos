# `api/v1/index.ts`

## Overview
Acts as the router aggregator for the entire `/v1/` REST API namespace.

## Components
- Combines the `healthRoutes` and `workflowRoutes` under the `/health` and `/workflows` paths, exporting a unified `Router` object to `app.ts`.
