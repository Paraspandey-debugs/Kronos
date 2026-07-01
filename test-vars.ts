import { topologicalSort, findAncestors, getAvailableVariables } from './frontend/src/components/FlowEditor/utils/variables';

const templates = [
  { type: 'start', outputSchema: {}, configSchema: {} },
  { type: 'scout', outputSchema: { type: 'object', properties: { url: { type: 'string' } } }, configSchema: {} }
];

const nodes = [
  { id: '1', type: 'start', data: { label: 'Start', payload: JSON.stringify({ myDynamic: "value" }) } },
  { id: '2', type: 'scout', data: { label: 'Scout' } }
] as any;

const edges = [
  { source: '1', target: '2' }
] as any;

const vars = getAvailableVariables(nodes, edges, '2', templates);
console.log(JSON.stringify(vars, null, 2));
