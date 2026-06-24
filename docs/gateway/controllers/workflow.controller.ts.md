# `controllers/workflow.controller.ts`

## Overview
The interface boundary handling the HTTP Request and Response for Workflows.

## Source Code & Implementation
```typescript
import { Request, Response, NextFunction } from 'express';
import { workflowService } from '../services/workflow.service';

export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await workflowService.createWorkflow(data);
    
    res.status(202).json({ 
      status: 'queued', 
      message: 'Workflow task created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
```

## Key Mechanisms
- **Thin Controller**: Contains zero business logic. It blindly passes the validated `req.body` to the `workflowService`.
- **Response**: Upon success, it immediately returns an HTTP `202 Accepted` indicating the work was received and queued (but not necessarily completed).
