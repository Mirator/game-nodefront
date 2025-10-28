/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').Faction} Faction */

import { DEFAULT_STRATEGY_ID, getStrategy, getStrategyList } from '../ai/index.js';
import { isAiFaction } from '../constants.js';

const DEFAULT_ACTION_BUDGET = Object.freeze({ total: 1 });
const DEFAULT_LATENCY = Object.freeze({ min: 0.25, max: 0.6 });
const MAX_QUEUE_RETRY = 3;

function cloneBudget(budget = DEFAULT_ACTION_BUDGET) {
  return {
    total: typeof budget?.total === 'number' ? budget.total : DEFAULT_ACTION_BUDGET.total,
    offensive:
      typeof budget?.offensive === 'number'
        ? budget.offensive
        : typeof budget?.offensive === 'undefined'
          ? undefined
          : DEFAULT_ACTION_BUDGET.total,
    defensive:
      typeof budget?.defensive === 'number'
        ? budget.defensive
        : typeof budget?.defensive === 'undefined'
          ? undefined
          : DEFAULT_ACTION_BUDGET.total,
  };
}

function resolveActionBudget(timing) {
  if (!timing?.actionBudget) {
    return DEFAULT_ACTION_BUDGET;
  }

  const provided = timing.actionBudget;
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

  return { total, offensive, defensive };
}

function resolveLatency(timing) {
  if (!timing?.latency) {
    return DEFAULT_LATENCY;
  }

  const provided = timing.latency;
  const min = Number.isFinite(provided.min) && provided.min >= 0 ? provided.min : DEFAULT_LATENCY.min;
  const max = Number.isFinite(provided.max) && provided.max >= min ? provided.max : Math.max(min, DEFAULT_LATENCY.max);
  return { min, max };
}

function resolveStrategyTiming(game, strategy) {
  const { aiTurnInterval, aiInitialDelay, aiNodeAttackDelay } = game.config;
  const timing = strategy.timing ?? {};

  const turnInterval =
    typeof timing.turnInterval === 'number' && Number.isFinite(timing.turnInterval) && timing.turnInterval > 0
      ? timing.turnInterval
      : typeof aiTurnInterval === 'number' && Number.isFinite(aiTurnInterval) && aiTurnInterval > 0
        ? aiTurnInterval
        : 0.35;

  const initialDelay =
    typeof timing.initialDelay === 'number' && Number.isFinite(timing.initialDelay) && timing.initialDelay >= 0
      ? timing.initialDelay
      : typeof aiInitialDelay === 'number' && Number.isFinite(aiInitialDelay) && aiInitialDelay >= 0
        ? aiInitialDelay
        : turnInterval;

  const nodeAttackDelay =
    typeof timing.nodeAttackDelay === 'number' && Number.isFinite(timing.nodeAttackDelay) && timing.nodeAttackDelay >= 0
      ? timing.nodeAttackDelay
      : typeof aiNodeAttackDelay === 'number' && Number.isFinite(aiNodeAttackDelay) && aiNodeAttackDelay >= 0
        ? aiNodeAttackDelay
        : 1;

  return {
    turnInterval,
    initialDelay,
    nodeAttackDelay,
    actionBudget: resolveActionBudget(timing),
    latency: resolveLatency(timing),
  };
}

function createAiController(faction) {
  return {
    faction,
    strategy: null,
    strategyId: DEFAULT_STRATEGY_ID,
    turnInterval: 0.35,
    initialDelay: 0.35,
    nodeAttackDelay: 1,
    actionBudgetTemplate: cloneBudget(DEFAULT_ACTION_BUDGET),
    latency: { ...DEFAULT_LATENCY },
    actionQueue: [],
    actionSequence: 0,
    cooldown: 0,
    turnBudget: null,
  };
}

function applyStrategyToController(game, controller, strategy) {
  const timing = resolveStrategyTiming(game, strategy);
  controller.strategy = strategy;
  controller.strategyId = strategy.id;
  controller.turnInterval = timing.turnInterval;
  controller.initialDelay = timing.initialDelay;
  controller.nodeAttackDelay = timing.nodeAttackDelay;
  controller.actionBudgetTemplate = cloneBudget(timing.actionBudget);
  controller.latency = { ...timing.latency };
}

function resetControllerRuntime(controller) {
  controller.actionQueue.length = 0;
  controller.actionSequence = 0;
  controller.turnBudget = null;
  controller.cooldown = controller.initialDelay;
}

/**
 * @param {FlowgridGame} game
 */
export function initializeAiState(game) {
  game.availableStrategies = getStrategyList();
  game.aiControllers = new Map();
  game.aiNodeAttackCooldown = new Map();
  const defaultStrategy = getStrategy(DEFAULT_STRATEGY_ID);
  game.aiStrategy = defaultStrategy;
  game.aiStrategyId = defaultStrategy.id;
}

/**
 * @param {FlowgridGame} game
 */
export function prepareAiControllersForLevel(game) {
  /** @type {Set<Faction>} */
  const factions = new Set();
  if (game.initialLevel) {
    for (const node of game.initialLevel.nodes) {
      if (isAiFaction(node.owner)) {
        factions.add(node.owner);
      }
    }
  }

  for (const faction of [...game.aiControllers.keys()]) {
    if (!factions.has(faction)) {
      game.aiControllers.delete(faction);
    }
  }

  const strategy = game.aiStrategy ?? getStrategy(game.aiStrategyId ?? DEFAULT_STRATEGY_ID);

  for (const faction of factions) {
    let controller = game.aiControllers.get(faction);
    if (!controller) {
      controller = createAiController(faction);
      game.aiControllers.set(faction, controller);
    }
    applyStrategyToController(game, controller, strategy);
    resetControllerRuntime(controller);
  }
}

/**
 * @param {ReturnType<typeof createAiController>} controller
 */
function hasBudget(controller, isOffensive) {
  const available = controller.turnBudget;
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

/**
 * @param {ReturnType<typeof createAiController>} controller
 */
function consumeBudget(controller, isOffensive) {
  const available = controller.turnBudget;
  if (!available) return;
  available.total -= 1;
  if (isOffensive && typeof available.offensive === 'number') {
    available.offensive -= 1;
  }
  if (!isOffensive && typeof available.defensive === 'number') {
    available.defensive -= 1;
  }
}

function getLatency(game, controller, latencyOverride) {
  if (typeof latencyOverride === 'number' && latencyOverride >= 0) {
    return latencyOverride;
  }
  const latency = controller.latency ?? DEFAULT_LATENCY;
  const min = Math.max(0, latency.min ?? DEFAULT_LATENCY.min);
  const max = Math.max(min, latency.max ?? DEFAULT_LATENCY.max);
  const randomFn = game.random ?? Math.random;
  const random = randomFn();
  return min + (max - min) * random;
}

function queuedLinkId(faction, sourceId, targetId, sequence) {
  return `queued:${faction}:${sourceId}->${targetId}:${sequence}`;
}

/**
 * @param {FlowgridGame} game
 * @param {Faction} faction
 */
function getController(game, faction) {
  return game.aiControllers?.get(faction) ?? null;
}

/**
 * @param {FlowgridGame} game
 * @param {Faction} faction
 * @param {string} sourceId
 * @param {string} targetId
 * @param {{ latency?: number }} [options]
 */
export function queueAiLink(game, faction, sourceId, targetId, options = {}) {
  const controller = getController(game, faction);
  if (!controller || !controller.turnBudget) {
    return false;
  }

  const source = game.nodes.get(sourceId);
  const target = game.nodes.get(targetId);
  if (!source || !target) return false;
  if (source.owner !== faction) return false;

  const outgoing = game.outgoingByNode.get(sourceId);
  if (!outgoing) return false;

  if (game.links.has(`${sourceId}->${targetId}`)) {
    return false;
  }

  const queuedFromSource = controller.actionQueue.reduce(
    (count, queued) => (queued.type === 'createLink' && queued.sourceId === sourceId ? count + 1 : count),
    0,
  );

  if (outgoing.length + queuedFromSource >= source.outgoingLimit) {
    return false;
  }

  const isOffensive = target.owner !== faction;
  if (!hasBudget(controller, isOffensive)) {
    return false;
  }

  const alreadyQueued = controller.actionQueue.some(
    (action) => action.type === 'createLink' && action.sourceId === sourceId && action.targetId === targetId,
  );
  if (alreadyQueued) {
    return false;
  }

  const latency = getLatency(game, controller, options.latency);
  const now = game.elapsedTime ?? 0;

  const action = {
    id: queuedLinkId(faction, sourceId, targetId, controller.actionSequence),
    type: 'createLink',
    sourceId,
    targetId,
    executeAt: now + latency,
    createdAt: now,
    isOffensive,
    retryCount: 0,
  };

  consumeBudget(controller, isOffensive);
  controller.actionSequence += 1;
  controller.actionQueue.push(action);
  return true;
}

function attemptQueuedLink(game, controller, action) {
  const source = game.nodes.get(action.sourceId);
  const target = game.nodes.get(action.targetId);
  if (!source || !target) {
    return false;
  }
  if (source.owner !== controller.faction) {
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
  if (!game.aiControllers) {
    return;
  }

  const now = game.elapsedTime ?? 0;

  for (const controller of game.aiControllers.values()) {
    if (controller.actionQueue.length === 0) {
      continue;
    }

    /** @type {typeof controller.actionQueue} */
    const remaining = [];
    for (const action of controller.actionQueue) {
      if (action.executeAt > now) {
        remaining.push(action);
        continue;
      }
      if (action.type !== 'createLink') {
        continue;
      }

      const result = attemptQueuedLink(game, controller, action);
      if (result === true) {
        continue;
      }

      if (result === 'retry' && action.retryCount < MAX_QUEUE_RETRY) {
        const latency = getLatency(game, controller);
        action.retryCount += 1;
        action.executeAt = now + latency;
        action.createdAt = now;
        remaining.push(action);
      }
    }

    controller.actionQueue = remaining;
  }
}

/**
 * @param {FlowgridGame} game
 */
export function runAiTurn(game, faction) {
  const controller = faction ? getController(game, faction) : null;
  if (!controller || !controller.strategy) {
    return;
  }
  controller.turnBudget = cloneBudget(controller.actionBudgetTemplate);
  controller.strategy.run(game, { faction: controller.faction });
  controller.turnBudget = null;
}

/**
 * @param {FlowgridGame} game
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
  return [...(game.availableStrategies ?? [])];
}

/**
 * @param {FlowgridGame} game
 * @returns {string}
 */
export function getAiStrategyId(game) {
  return game.aiStrategyId ?? DEFAULT_STRATEGY_ID;
}

/**
 * @param {FlowgridGame} game
 * @returns {string}
 */
export function getAiStrategyLabel(game) {
  return game.aiStrategy ? game.aiStrategy.label : '';
}

/**
 * @param {FlowgridGame} game
 * @param {string} id
 */
export function setAiStrategy(game, id, options = {}) {
  const strategy = getStrategy(id);
  game.aiStrategy = strategy;
  game.aiStrategyId = strategy.id;

  if (!game.aiControllers) {
    return;
  }

  for (const controller of game.aiControllers.values()) {
    applyStrategyToController(game, controller, strategy);
    resetControllerRuntime(controller);
  }

  if (!options?.silent) {
    game.showTemporaryPrompt(`AI strategy: ${strategy.label}`, 'normal', 1800);
  }
}

export function getAiStrategyList() {
  return getStrategyList();
}
