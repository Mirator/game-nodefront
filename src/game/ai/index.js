import { aggressiveSimple } from './strategies/aggressiveSimple.js';
import { neutralSimple } from './strategies/neutralSimple.js';
import { slowSimple } from './strategies/slowSimple.js';

export const DEFAULT_STRATEGY_ID = 'neutral-simple';

export const AI_STRATEGIES = {
  'neutral-simple': {
    id: 'neutral-simple',
    label: 'Neutral Focus (Simple)',
    run: neutralSimple,
    timing: {
      turnInterval: 0.4,
      initialDelay: 0.5,
      nodeAttackDelay: 1,
      actionBudget: {
        total: 1,
      },
      latency: {
        min: 0.4,
        max: 0.8,
      },
    },
  },
  'aggressive-simple': {
    id: 'aggressive-simple',
    label: 'Aggressive (Simple)',
    run: aggressiveSimple,
    timing: {
      turnInterval: 0.3,
      initialDelay: 0.45,
      nodeAttackDelay: 0.75,
      actionBudget: {
        total: 2,
      },
      latency: {
        min: 0.2,
        max: 0.55,
      },
    },
  },
  'slow-simple': {
    id: 'slow-simple',
    label: 'Deliberate (Slow)',
    run: slowSimple,
    timing: {
      turnInterval: 1.8,
      initialDelay: 2.4,
      nodeAttackDelay: 1.5,
      actionBudget: {
        total: 1,
      },
      latency: {
        min: 0.9,
        max: 1.5,
      },
    },
  },
};

export function getStrategy(id) {
  return AI_STRATEGIES[id] ?? AI_STRATEGIES[DEFAULT_STRATEGY_ID];
}

export function getStrategyList() {
  return Object.values(AI_STRATEGIES);
}
