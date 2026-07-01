import { ScoutNode } from './ScoutNode';
import { CompressorNode } from './CompressorNode';
import { StartNode } from './StartNode';
import { EndNode } from './EndNode';
import { DecisionNode } from './DecisionNode';

export const nodeTypes = {
  scout: ScoutNode,
  compressor: CompressorNode,
  start: StartNode,
  end: EndNode,
  decision: DecisionNode,
};
