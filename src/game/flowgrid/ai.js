/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
import { DEFAULT_STRATEGY_ID, getStrategy, getStrategyList } from '../ai/index.js';

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
  };
}

function applyStrategy(game, strategy, { silent = false } = {}) {
  game.aiStrategy = strategy;
  game.aiStrategyId = strategy.id;

  const { turnInterval, initialDelay, nodeAttackDelay } = resolveStrategyTiming(game, strategy);
  game.aiTurnInterval = turnInterval;
  game.aiInitialDelay = initialDelay;
  game.aiNodeAttackDelay = nodeAttackDelay;

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
  game.aiStrategy.run(game);
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
