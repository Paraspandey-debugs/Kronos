# `handlers/scout.handler.ts`

## Overview
A specialized agent handler function designed to perform OSINT/research "scouting" tasks in the background.

## Source Code & Implementation
```typescript
export const scoutHandler = async (payload: any) => {
  console.log(` Scouting target: ${payload.target}`);
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    findings: `Found leads for ${payload.target}`,
    score: Math.floor(Math.random() * 100),
  };
};
```

## Key Mechanisms
- **Isolation**: Receives purely the `payload` dictionary from the original API request. It does not need to know about HTTP requests, Zod, or queues.
- **Return Value**: Any object returned by the handler is stringified and stored directly into PostgreSQL under the `result` JSON column for the task.
