import { aggressiveSimple } from './strategies/aggressiveSimple.js';
import { neutralSimple } from './strategies/neutralSimple.js';

export const AI_STRATEGIES = {
  'aggressive-simple': {
    id: 'aggressive-simple',
    label: 'Aggressive (Simple)',
    run: aggressiveSimple,
  },
  'neutral-simple': {
    id: 'neutral-simple',
    label: 'Neutral Focus (Simple)',
    run: neutralSimple,
  },
};

export function getStrategy(id) {
  return AI_STRATEGIES[id] ?? AI_STRATEGIES['aggressive-simple'];
}

export function getStrategyList() {
  return Object.values(AI_STRATEGIES);
}
