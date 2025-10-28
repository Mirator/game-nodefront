/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
import { DEFAULT_STRATEGY_ID, getStrategy, getStrategyList } from '../ai/index.js';

const DEFAULT_ACTION_BUDGET = Object.freeze({ total: 1 });
const DEFAULT_LATENCY = Object.freeze({ min: 0.25, max: 0.6 });
const MAX_QUEUE_RETRY = 3;

function cloneBudget(budget = DEFAULT_ACTION_BUDGET) {
  return {
    total: typeof budget.total === 'number' ? budget.total : DEFAULT_ACTION_BUDGET.total,
    offensive:
      typeof budget.offensive === 'number'
        ? budget.offensive
        : typeof budget.offensive === 'undefined'
          ? undefined
          : DEFAULT_ACTION_BUDGET.total,
    defensive:
      typeof budget.defensive === 'number'
        ? budget.defensive
        : typeof budget.defensive === 'undefined'
          ? undefined
          : DEFAULT_ACTION_BUDGET.total,
  };
}

function resolveActionBudget(timing) {
  const provided = timing?.actionBudget;
  if (!provided) {
    return DEFAULT_ACTION_BUDGET;
  }

  const total = Number.isFinite(provided.total) && provided.total > 0 ? provided.total : DEFAULT_ACTION_BUDGET.total;
  const offensive =
    provided.offensive === undefined || provided.offensive === null
      ? undefined
      : Number.isFinite(provided.offensive) && provided.offensive >= 0
        ? provided.offensive
        : 0;
  const defensive =
    provided.defensive === undefined || provided.defensive === null
      ? undefined
      : Number.isFinite(provided.defensive) && provided.defensive >= 0
        ? provided.defensive
        : 0;

  return {
    total,
    offensive,
    defensive,
  };
}

function resolveLatency(timing) {
  const provided = timing?.latency;
  if (!provided) {
    return DEFAULT_LATENCY;
  }

  const min = Number.isFinite(provided.min) && provided.min >= 0 ? provided.min : DEFAULT_LATENCY.min;
  const max = Number.isFinite(provided.max) && provided.max >= min ? provided.max : Math.max(min, DEFAULT_LATENCY.max);

  return { min, max };
}

function resolveStrategyTiming(game, strategy) {
  const { aiTurnInterval, aiInitialDelay, aiNodeAttackDelay } = game.config;
  const timing = strategy.timing ?? {};

  const resolvedTurnInterval =
    typeof timing.turnInterval === 'number' && Number.isFinite(timing.turnInterval) && timing.turnInterval > 0
      ? timing.turnInterval
      : typeof aiTurnInterval === 'number' && Number.isFinite(aiTurnInterval) && aiTurnInterval > 0
        ? aiTurnInterval
        : 0.35;

  const resolvedInitialDelay =
    typeof timing.initialDelay === 'number' && Number.isFinite(timing.initialDelay) && timing.initialDelay >= 0
      ? timing.initialDelay
      : typeof aiInitialDelay === 'number' && Number.isFinite(aiInitialDelay) && aiInitialDelay >= 0
        ? aiInitialDelay
        : resolvedTurnInterval;

  const resolvedNodeAttackDelay =
    typeof timing.nodeAttackDelay === 'number' && Number.isFinite(timing.nodeAttackDelay) && timing.nodeAttackDelay >= 0
      ? timing.nodeAttackDelay
      : typeof aiNodeAttackDelay === 'number' && Number.isFinite(aiNodeAttackDelay) && aiNodeAttackDelay >= 0
        ? aiNodeAttackDelay
        : 1;

  return {
    turnInterval: resolvedTurnInterval,
    initialDelay: resolvedInitialDelay,
    nodeAttackDelay: resolvedNodeAttackDelay,
    actionBudget: resolveActionBudget(timing),
    latency: resolveLatency(timing),
  };
}

function applyStrategy(game, strategy, { silent = false } = {}) {
  game.aiStrategy = strategy;
  game.aiStrategyId = strategy.id;

  const { turnInterval, initialDelay, nodeAttackDelay, actionBudget, latency } = resolveStrategyTiming(game, strategy);
  game.aiTurnInterval = turnInterval;
  game.aiInitialDelay = initialDelay;
  game.aiNodeAttackDelay = nodeAttackDelay;
  game.aiActionBudgetTemplate = cloneBudget(actionBudget);
  game.aiLatency = { ...latency };
  if (game.aiActionQueue) {
    game.aiActionQueue.length = 0;
    game.aiActionSequence = 0;
  }

  if (game.aiNodeAttackCooldown) {
    for (const nodeId of game.aiNodeAttackCooldown.keys()) {
      game.aiNodeAttackCooldown.set(nodeId, nodeAttackDelay);
    }
  }

  game.aiCooldown = game.aiInitialDelay;

  if (!silent) {
    game.showTemporaryPrompt(`AI strategy: ${strategy.label}`, 'normal', 1800);
  }
}

/**
 * @param {FlowgridGame} game
 */
export function initializeAiState(game) {
  game.availableStrategies = getStrategyList();
  const defaultStrategy = getStrategy(DEFAULT_STRATEGY_ID);
  game.aiNodeAttackCooldown = new Map();
  game.aiActionQueue = [];
  game.aiActionSequence = 0;
  game.aiLatency = { ...DEFAULT_LATENCY };
  game.aiActionBudgetTemplate = { ...DEFAULT_ACTION_BUDGET };
  game.aiTurnBudget = null;
  applyStrategy(game, defaultStrategy, { silent: true });
  game.aiCooldown = game.aiInitialDelay;
}

/**
 * @param {FlowgridGame} game
 */
export function runAiTurn(game) {
  if (!game.aiStrategy) {
    return;
  }
  game.aiTurnBudget = cloneBudget(game.aiActionBudgetTemplate ?? DEFAULT_ACTION_BUDGET);
  game.aiStrategy.run(game);
  game.aiTurnBudget = null;
}

/**
 * @param {FlowgridGame} game
 * @param {import('../../types.js').NodeState} node
 */
export function trimAiLinksIfWeak(game, node) {
  const outgoing = game.outgoingByNode.get(node.id);
  if (!outgoing || outgoing.length === 0) return;
  if (node.energy > node.safetyReserve + 5) return;

  /** @type {import('../../types.js').LinkState | null} */
  let longest = null;
  for (const link of outgoing) {
    if (!longest || link.length > longest.length) {
      longest = link;
    }
  }
  if (longest) {
    game.removeLink(longest.id);
  }
}

/**
 * @param {FlowgridGame} game
 * @returns {ReadonlyArray<{ id: string; label: string }>}
 */
export function getAvailableStrategies(game) {
  return [...game.availableStrategies];
}

/**
 * @param {FlowgridGame} game
 * @returns {string}
 */
export function getAiStrategyId(game) {
  return game.aiStrategyId;
}

/**
 * @param {FlowgridGame} game
 * @param {string} id
 */
export function setAiStrategy(game, id, options = {}) {
  const strategy = getStrategy(id);
  applyStrategy(game, strategy, options);
}

/**
 * @param {FlowgridGame} game
 * @returns {string}
 */
export function getAiStrategyLabel(game) {
  return game.aiStrategy ? game.aiStrategy.label : '';
}

function hasBudget(available, isOffensive) {
  if (!available) return false;
  if (available.total <= 0) return false;
  if (isOffensive) {
    if (typeof available.offensive === 'number' && available.offensive <= 0) {
      return false;
    }
  } else if (typeof available.defensive === 'number' && available.defensive <= 0) {
    return false;
  }
  return true;
}

function consumeBudget(available, isOffensive) {
  if (!available) return;
  available.total -= 1;
  if (isOffensive && typeof available.offensive === 'number') {
    available.offensive -= 1;
  }
  if (!isOffensive && typeof available.defensive === 'number') {
    available.defensive -= 1;
  }
}

function getLatency(game, latencyOverride) {
  if (typeof latencyOverride === 'number' && latencyOverride >= 0) {
    return latencyOverride;
  }
  const latency = game.aiLatency ?? DEFAULT_LATENCY;
  const min = Math.max(0, latency.min ?? DEFAULT_LATENCY.min);
  const max = Math.max(min, latency.max ?? DEFAULT_LATENCY.max);
  const random = game.random ? game.random() : Math.random();
  return min + (max - min) * random;
}

function queuedLinkId(sourceId, targetId, sequence) {
  return `queued:${sourceId}->${targetId}:${sequence}`;
}

/**
 * @param {FlowgridGame} game
 * @param {string} sourceId
 * @param {string} targetId
 * @param {{ latency?: number }} [options]
 */
export function queueAiLink(game, sourceId, targetId, options = {}) {
  if (!game.aiTurnBudget) {
    return false;
  }

  const source = game.nodes.get(sourceId);
  const target = game.nodes.get(targetId);
  if (!source || !target) return false;
  if (source.owner !== 'ai') return false;

  const outgoing = game.outgoingByNode.get(sourceId);
  if (!outgoing) return false;

  if (game.links.has(`${sourceId}->${targetId}`)) {
    return false;
  }

  const queuedFromSource = game.aiActionQueue?.reduce(
    (count, queued) =>
      queued.type === 'createLink' && queued.sourceId === sourceId ? count + 1 : count,
    0,
  );

  if (outgoing.length + (queuedFromSource ?? 0) >= source.outgoingLimit) {
    return false;
  }

  const isOffensive = target.owner !== 'ai';
  if (!hasBudget(game.aiTurnBudget, isOffensive)) {
    return false;
  }

  const alreadyQueued = game.aiActionQueue?.some(
    (action) => action.type === 'createLink' && action.sourceId === sourceId && action.targetId === targetId,
  );
  if (alreadyQueued) {
    return false;
  }

  const latency = getLatency(game, options.latency);
  const now = game.elapsedTime ?? 0;

  const action = {
    id: queuedLinkId(sourceId, targetId, game.aiActionSequence ?? 0),
    type: 'createLink',
    sourceId,
    targetId,
    executeAt: now + latency,
    createdAt: now,
    isOffensive,
    retryCount: 0,
  };

  consumeBudget(game.aiTurnBudget, isOffensive);
  game.aiActionSequence = (game.aiActionSequence ?? 0) + 1;
  game.aiActionQueue.push(action);
  return true;
}

function attemptQueuedLink(game, action) {
  const source = game.nodes.get(action.sourceId);
  const target = game.nodes.get(action.targetId);
  if (!source || !target) {
    return false;
  }
  if (source.owner !== 'ai') {
    return false;
  }

  const cooldown = game.aiNodeAttackCooldown.get(source.id);
  if (cooldown && cooldown > 0) {
    return 'retry';
  }

  const outgoing = game.outgoingByNode.get(source.id);
  if (!outgoing || outgoing.length >= source.outgoingLimit) {
    return 'retry';
  }

  if (game.links.has(`${source.id}->${target.id}`)) {
    return true;
  }

  const before = game.links.size;
  game.createLink(source.id, target.id);
  const afterLink = game.links.has(`${source.id}->${target.id}`);
  if (afterLink) {
    return true;
  }
  return before !== game.links.size ? true : 'retry';
}

/**
 * @param {FlowgridGame} game
 */
export function processAiActionQueue(game) {
  if (!game.aiActionQueue || game.aiActionQueue.length === 0) {
    return;
  }

  const now = game.elapsedTime ?? 0;
  /** @type {typeof game.aiActionQueue} */
  const remaining = [];

  for (const action of game.aiActionQueue) {
    if (action.executeAt > now) {
      remaining.push(action);
      continue;
    }

    if (action.type !== 'createLink') {
      continue;
    }

    const result = attemptQueuedLink(game, action);
    if (result === true) {
      continue;
    }

    if (result === 'retry' && action.retryCount < MAX_QUEUE_RETRY) {
      const latency = getLatency(game);
      action.retryCount += 1;
      action.executeAt = now + latency;
      action.createdAt = now;
      remaining.push(action);
    }
  }

  game.aiActionQueue = remaining;
}
