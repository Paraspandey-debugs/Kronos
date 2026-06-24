# `api/v1/workflows.routes.ts`

## Overview
Handles the routing and middleware attachment for the workflow endpoints.

## Source Code & Implementation
```typescript
import { Router } from 'express';
import { createWorkflow } from '../../controllers/workflow.controller';
import { validate } from '../../middleware/validator';
import { createWorkflowSchema } from '../../schemas/workflow.schema';

const router = Router();

router.post('/', validate(createWorkflowSchema), createWorkflow);

export default router;
```

## Key Mechanisms
- Intercepts all incoming `POST` requests.
- Invokes the `validate` middleware with the `createWorkflowSchema` before it ever reaches the `createWorkflow` controller.
