/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

/**
 * @param {FlowgridGame} game
 */
export function registerInputHandlers(game) {
  const { canvas } = game;

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    game.pointer.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    game.pointer.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    game.pointer.hoverNode = game.hitTestNode(game.pointer.x, game.pointer.y);
  });

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button === 2) {
      game.deleteLinkAtPointer();
      return;
    }
    if (event.button !== 0) {
      return;
    }

    const node = game.pointer.hoverNode;
    if (node && node.owner === 'player') {
      game.pointer.dragSource = node;
      game.pointer.isDragging = true;
      if (!game.tutorialShown) {
        game.setPrompt('Shorter routes transfer energy faster.');
        game.tutorialShown = true;
      }
    }
  });

  canvas.addEventListener('pointerup', (event) => {
    if (event.button !== 0) {
      return;
    }

    if (game.pointer.isDragging && game.pointer.dragSource) {
      const target = game.hitTestNode(game.pointer.x, game.pointer.y);
      if (target && target.id !== game.pointer.dragSource.id) {
        game.createLink(game.pointer.dragSource.id, target.id);
      }
    }
    game.pointer.dragSource = null;
    game.pointer.isDragging = false;
  });

  canvas.addEventListener('pointerleave', () => {
    game.pointer.hoverNode = null;
    game.pointer.dragSource = null;
    game.pointer.isDragging = false;
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      game.togglePause();
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      game.restart();
      return;
    }

    if (game.lastCreatedLink) {
      const preset = game.config.sharePresets[event.key];
      if (typeof preset === 'number') {
        game.applySharePreset(game.lastCreatedLink, preset);
      }
    }
  });

  game.hudElements.restartButton.addEventListener('click', () => game.restart());
}
