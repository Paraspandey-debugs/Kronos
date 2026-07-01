import { WorkflowNode } from '@prisma/client';

export function resolveVariables(
  input: any,
  previousSteps: WorkflowNode[]
): any {
  if (typeof input === 'string') {
    // Match patterns like $step_id.data or $step_index.user.id
    // First, let's try $nodeId.path
    // But usually it's $step_0.field based on stepIndex in the current app
    const match = input.match(/^\$step_([^.]+)\.(.+)$/);
    if (match) {
      const [, stepRef, path] = match;
      
      // stepRef could be a stepIndex (number string) or a UUID
      let step = previousSteps.find(s => s.id === stepRef);
      if (!step) {
         // Fallback to stepIndex for backward compatibility
         step = previousSteps.find(s => String(s.stepIndex) === stepRef);
      }

      if (!step || step.status !== 'COMPLETED') {
        throw new Error(`Step ${stepRef} not completed or missing`);
      }
      // Traverse the path (e.g., "user.id" => step.result.user.id)
      return path.split('.').reduce((obj: any, key: string) => obj?.[key], step.result);
    }
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(item => resolveVariables(item, previousSteps));
  }

  if (typeof input === 'object' && input !== null) {
    const result: any = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = resolveVariables(value, previousSteps);
    }
    return result;
  }

  return input;
}
