# `types/workflow.types.ts`

## Overview
Generates native TypeScript interfaces directly from the Zod runtime schemas. This prevents DRY violations.

## Source Code & Implementation
```typescript
import { z } from 'zod';
import { createWorkflowSchema } from '../schemas/workflow.schema';

export type CreateWorkflowRequest = z.infer<typeof createWorkflowSchema>['body'];
```

## Key Mechanisms
- Uses `z.infer` to extract the `body` shape. This type is exported and utilized directly by the `workflow.service.ts` so that the service layer knows exactly what structure the API passed to it.
