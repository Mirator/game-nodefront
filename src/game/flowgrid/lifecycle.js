/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

import { resetState } from './state.js';

/**
 * @param {FlowgridGame} game
 */
export function start(game) {
  if (game.running) {
    return;
  }
  game.running = true;
  game.lastTimestamp = performance.now();
  game.animationFrame = requestAnimationFrame(game.loop);
}

/**
 * @param {FlowgridGame} game
 * @returns {boolean}
 */
export function isRunning(game) {
  return game.running;
}

/**
 * @param {FlowgridGame} game
 * @returns {boolean}
 */
export function isPaused(game) {
  return game.paused;
}

/**
 * @param {FlowgridGame} game
 * @param {boolean} [showIndicator]
 */
export function pause(game, showIndicator = true) {
  if (game.paused) {
    if (showIndicator) {
      game.hudElements.pauseIndicator.style.display = 'block';
      game.hudElements.pauseIndicator.textContent = 'Paused';
    } else {
      game.hudElements.pauseIndicator.style.display = 'none';
    }
    return;
  }

  game.paused = true;
  if (showIndicator) {
    game.hudElements.pauseIndicator.style.display = 'block';
    game.hudElements.pauseIndicator.textContent = 'Paused';
  } else {
    game.hudElements.pauseIndicator.style.display = 'none';
  }
}

/**
 * @param {FlowgridGame} game
 */
export function resume(game) {
  if (!game.paused) {
    return;
  }
  game.paused = false;
  game.hudElements.pauseIndicator.style.display = 'none';
}

/**
 * @param {FlowgridGame} game
 */
export function togglePause(game) {
  if (game.paused) {
    resume(game);
  } else {
    pause(game);
  }
}

/**
 * @param {FlowgridGame} game
 */
export function restart(game) {
  resetState(game);
}
