import { WorkflowNode } from '@prisma/client';

export function resolveVariables(
  input: any,
  previousSteps: WorkflowNode[]
): any {
  if (typeof input === 'string') {
    // 1. Exact match pattern: $step_id.data (returns the exact object/value, not just a string)
    const exactMatch = input.match(/^\$step_([^.]+)\.(.+)$/);
    if (exactMatch) {
      const [, stepRef, path] = exactMatch;
      let step = previousSteps.find(s => s.id === stepRef || String(s.stepIndex) === stepRef);
      if (!step || step.status !== 'COMPLETED') {
        throw new Error(`Step ${stepRef} not completed or missing`);
      }
      return path.split('.').reduce((obj: any, key: string) => obj?.[key], step.result);
    }

    // 2. Interpolation pattern: "some text {{$step_1.data}} more text" or "some text $step_1.data"
    // Let's replace {{$step_x.y}} occurrences
    if (input.includes('{{') && input.includes('}}')) {
      return input.replace(/\{\{\$step_([^.]+)\.([^}]+)\}\}/g, (match, stepRef, path) => {
        let step = previousSteps.find(s => s.id === stepRef || String(s.stepIndex) === stepRef);
        if (!step || step.status !== 'COMPLETED') {
          return match; // Leave unreplaced if not found
        }
        const val = path.split('.').reduce((obj: any, key: string) => obj?.[key], step.result);
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      });
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
