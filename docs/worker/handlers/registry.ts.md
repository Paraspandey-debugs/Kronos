# `handlers/registry.ts`

## Overview
Acts as the central routing map. Instead of using massive `switch` or `if/else` statements inside the main worker loop, the registry abstracts handler dispatch.

## Source Code & Implementation
```typescript
import { scoutHandler } from './scout.handler';
import { compressorHandler } from './compressor.handler';

export const handlerRegistry: Record<string, (payload: any) => Promise<any>> = {
  scout: scoutHandler,
  compressor: compressorHandler,
};
```

## Key Mechanisms
- **Dynamic Lookup**: Translates the `agentType` string (e.g., `"scout"`) passed directly from the API layer into the exact asynchronous handler function required to do the work.
- **Extensibility**: To add a new AI agent or background task to Engine B, developers simply import the new handler file here and add a single line mapping its identifier.
