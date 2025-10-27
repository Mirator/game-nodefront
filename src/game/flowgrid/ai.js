/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
import { DEFAULT_STRATEGY_ID, getStrategy, getStrategyList } from '../ai/index.js';

/**
 * @param {FlowgridGame} game
 */
export function initializeAiState(game) {
  game.availableStrategies = getStrategyList();
  const defaultStrategy = getStrategy(DEFAULT_STRATEGY_ID);
  game.aiStrategy = defaultStrategy;
  game.aiStrategyId = defaultStrategy.id;

  game.aiTurnInterval =
    typeof game.config.aiTurnInterval === 'number' &&
    Number.isFinite(game.config.aiTurnInterval) &&
    game.config.aiTurnInterval > 0
      ? game.config.aiTurnInterval
      : 0.35;
  game.aiInitialDelay =
    typeof game.config.aiInitialDelay === 'number' &&
    Number.isFinite(game.config.aiInitialDelay) &&
    game.config.aiInitialDelay >= 0
      ? game.config.aiInitialDelay
      : game.aiTurnInterval;
  game.aiNodeAttackDelay =
    typeof game.config.aiNodeAttackDelay === 'number' &&
    Number.isFinite(game.config.aiNodeAttackDelay) &&
    game.config.aiNodeAttackDelay >= 0
      ? game.config.aiNodeAttackDelay
      : 1;
  game.aiNodeAttackCooldown = new Map();
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
export function setAiStrategy(game, id) {
  const strategy = getStrategy(id);
  game.aiStrategy = strategy;
  game.aiStrategyId = strategy.id;
  game.showTemporaryPrompt(`AI strategy: ${strategy.label}`, 'normal', 1800);
}
