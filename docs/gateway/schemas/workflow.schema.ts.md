# `schemas/workflow.schema.ts`

## Overview
Defines the strict type-safe schema constraints for workflow payloads entering the Gateway.

## Source Code & Implementation
```typescript
import { z } from 'zod';

export const createWorkflowSchema = z.object({
  body: z.object({
    agentType: z.string().min(1, 'Agent type is required'),
    payload: z.record(z.string(), z.any()),
    priority: z.enum(['low', 'normal', 'high']).optional(),
  }),
});
```

## Constraints
- **`agentType`**: Must be a non-empty string.
- **`payload`**: Accepts an arbitrary JSON dictionary object (requires string keys for Zod v4 `z.record` syntax).
- **`priority`**: Optional enum restricting the priority value.
