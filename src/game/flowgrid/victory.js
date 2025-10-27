/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').Faction} Faction */
/** @typedef {import('../../types.js').NodeState} NodeState */

/**
 * @param {FlowgridGame} game
 * @param {NodeState} node
 * @param {Faction} newOwner
 */
export function captureNode(game, node, newOwner) {
  node.owner = newOwner;
  node.energy = game.config.captureSeed;

  if (newOwner === 'ai') {
    if (game.aiNodeAttackDelay > 0) {
      game.aiNodeAttackCooldown.set(node.id, game.aiNodeAttackDelay);
    } else {
      game.aiNodeAttackCooldown.delete(node.id);
    }
  } else {
    game.aiNodeAttackCooldown.delete(node.id);
  }

  const outgoing = game.outgoingByNode.get(node.id) ?? [];
  for (const link of [...outgoing]) {
    game.removeLink(link.id);
  }
}

/**
 * @param {FlowgridGame} game
 */
export function checkVictory(game) {
  let playerNodes = 0;
  let aiNodes = 0;

  for (const node of game.nodes.values()) {
    if (node.owner === 'player') {
      playerNodes += 1;
    } else if (node.owner === 'ai') {
      aiNodes += 1;
    }
  }

  if (aiNodes === 0 && playerNodes > 0) {
    game.setWinner('player');
    return;
  }

  if (playerNodes === 0 && aiNodes > 0) {
    game.setWinner('ai');
  }
}

/**
 * @param {FlowgridGame} game
 * @param {Faction} faction
 */
export function setWinner(game, faction) {
  game.winner = faction;
  game.paused = true;
  game.hudElements.endScreen.style.display = 'flex';
  game.hudElements.endHeadline.textContent =
    faction === 'player' ? 'Network Secured' : 'Network Compromised';
}
