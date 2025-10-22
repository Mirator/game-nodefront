import { aggressiveSimple } from './strategies/aggressiveSimple.js';
import { neutralSimple } from './strategies/neutralSimple.js';

export const DEFAULT_STRATEGY_ID = 'neutral-simple';

export const AI_STRATEGIES = {
  'neutral-simple': {
    id: 'neutral-simple',
    label: 'Neutral Focus (Simple)',
    run: neutralSimple,
  },
  'aggressive-simple': {
    id: 'aggressive-simple',
    label: 'Aggressive (Simple)',
    run: aggressiveSimple,
  },
};

export function getStrategy(id) {
  return AI_STRATEGIES[id] ?? AI_STRATEGIES[DEFAULT_STRATEGY_ID];
}

export function getStrategyList() {
  return Object.values(AI_STRATEGIES);
}
