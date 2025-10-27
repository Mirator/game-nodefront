/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

/**
 * @param {FlowgridGame} game
 */
export function clearPromptTimeout(game) {
  if (game.promptTimeout) {
    window.clearTimeout(game.promptTimeout);
    game.promptTimeout = 0;
  }
}

/**
 * @param {FlowgridGame} game
 * @param {string} message
 * @param {"normal" | "warning"} [variant]
 */
export function setPrompt(game, message, variant = 'normal') {
  clearPromptTimeout(game);
  game.promptLastMessage = message;
  game.promptLastVariant = variant;
  applyPrompt(game, message, variant);
}

/**
 * @param {FlowgridGame} game
 * @param {string} message
 * @param {"normal" | "warning"} [variant]
 */
export function applyPrompt(game, message, variant = 'normal') {
  const prompt = game.hudElements.prompt;
  prompt.textContent = message;
  if (variant === 'warning') {
    prompt.classList.add('warning');
  } else {
    prompt.classList.remove('warning');
  }
}

/**
 * @param {FlowgridGame} game
 * @param {string} message
 * @param {"normal" | "warning"} [variant]
 * @param {number} [duration]
 */
export function showTemporaryPrompt(game, message, variant = 'normal', duration = 2000) {
  clearPromptTimeout(game);
  applyPrompt(game, message, variant);
  game.promptTimeout = window.setTimeout(() => {
    applyPrompt(game, game.promptLastMessage, game.promptLastVariant);
    game.promptTimeout = 0;
  }, duration);
}
