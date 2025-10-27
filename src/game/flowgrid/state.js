/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').LevelDefinition} LevelDefinition */
/** @typedef {import('../../types.js').NodeState} NodeState */

import { createPointerState } from '../pointer.js';

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
export function resetState(game) {
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
    /** @type {NodeState} */
    const node = {
      ...definition,
      energy: definition.energy,
      outgoingLimit: game.config.outgoingLimit,
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
