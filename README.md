# Kronos Orchestration Engine

Kronos is a distributed workflow engine that leverages Redis, PostgreSQL, and BullMQ to decouple task ingestion from asynchronous execution.

## Features

### Dynamic Payload Resolution
Steps in a workflow can reference outputs from previous steps dynamically. This allows data to flow seamlessly across agents without manual intervention.

To reference data from a prior step, use the `$step_<INDEX>.path` syntax in your payload. 

**Example Workflow:**

```json
{
  "steps": [
    { 
      "agentType": "scout", 
      "payload": { "target": "github.com" } 
    },
    { 
      "agentType": "repo_analyzer", 
      "payload": { "repo": "$step_0.repo_name" } 
    }
  ]
}
```

When Step 1 (`scout`) finishes, its `result` is saved to the database. Before executing Step 2 (`repo_analyzer`), the Orchestrator evaluates `$step_0.repo_name` and replaces it with the actual value returned from the `scout` agent.

### Architecture

1. **Engine A (Orchestrator)**: Coordinates workflows, tracks states in Prisma, and resolves dynamic payload variables before pushing individual steps to execution.
2. **Engine B (Worker)**: Responsible for pulling executing agents/handlers (e.g., `scout`, `compressor`, `echo`) from the task queue.
3. **Gateway**: A REST API validating tasks and submitting pipelines.
