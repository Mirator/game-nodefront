/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').LevelDefinition} LevelDefinition */
/** @typedef {import('../../types.js').NodeState} NodeState */

import { createPointerState } from '../pointer.js';
import { createSeededRng, normalizeSeed } from '../math.js';
import { DEFAULT_NODE_TYPE, NODE_TYPES } from '../nodeTypes.js';

/**
 * @param {FlowgridGame} game
 * @param {LevelDefinition} level
 */
export function applyLevel(game, level) {
  game.initialLevel = level;
  game.canvas.width = level.width;
  game.canvas.height = level.height;
  if (level.name) {
    game.hudElements.title.textContent = `Flowgrid — ${level.name}`;
  } else {
    game.hudElements.title.textContent = 'Flowgrid';
  }
}

/**
 * @param {FlowgridGame} game
 * @param {LevelDefinition} level
 */
export function loadLevel(game, level) {
  applyLevel(game, level);
  resetState(game);
}

/**
 * @param {FlowgridGame} game
 */
function deriveGameSeed(game) {
  if (game.initialLevel && Number.isFinite(game.initialLevel.seed)) {
    return normalizeSeed(game.initialLevel.seed);
  }
  if (Number.isFinite(game.config.captureSeed)) {
    return normalizeSeed(game.config.captureSeed);
  }
  if (Number.isFinite(game.randomSeed)) {
    return normalizeSeed(game.randomSeed);
  }
  return 0;
}

/**
 * @param {FlowgridGame} game
 */
export function resetState(game) {
  const seed = deriveGameSeed(game);
  game.randomSeed = seed;
  game.randomGenerator = createSeededRng(seed);

  game.nodes.clear();
  game.links.clear();
  game.outgoingByNode.clear();
  game.incomingByNode.clear();
  game.lastCreatedLink = null;
  game.pointer = createPointerState();
  game.accumulator = 0;
  game.lastTimestamp = performance.now();
  game.paused = false;
  game.winner = null;
  game.aiCooldown = game.aiInitialDelay;
  game.aiNodeAttackCooldown.clear();

  for (const definition of game.initialLevel.nodes) {
    const type = definition.type ?? DEFAULT_NODE_TYPE;
    const typeConfig = NODE_TYPES[type];
    if (!typeConfig) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const energy = Math.min(
      definition.energy ?? typeConfig.capacity,
      typeConfig.capacity,
    );

    /** @type {NodeState} */
    const node = {
      ...definition,
      type,
      capacity: typeConfig.capacity,
      regen: typeConfig.regen,
      radius: typeConfig.radius,
      energy,
      outgoingLimit: typeConfig.outgoingLimit,
      safetyReserve: game.config.safetyReserve,
    };
    game.nodes.set(node.id, node);
    if (node.owner === 'ai' && game.aiNodeAttackDelay > 0) {
      game.aiNodeAttackCooldown.set(node.id, game.aiNodeAttackDelay);
    }
  }

  for (const node of game.nodes.values()) {
    game.outgoingByNode.set(node.id, []);
    game.incomingByNode.set(node.id, []);
  }

  game.setPrompt('Drag from a blue node to capture neutrals. Right-click links to remove.');
  game.hudElements.pauseIndicator.style.display = 'none';
  game.hudElements.endScreen.style.display = 'none';
  game.tutorialShown = false;
}
