/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').Faction} Faction */
/** @typedef {import('../../types.js').NodeState} NodeState */
import { isAiFaction } from '../constants.js';

/**
 * @param {FlowgridGame} game
 * @param {NodeState} node
 * @param {Faction} newOwner
 */
export function captureNode(game, node, newOwner) {
  node.owner = newOwner;
  node.energy = game.config.captureSeed;

  if (isAiFaction(newOwner)) {
    const controller = game.aiControllers?.get(newOwner);
    if (controller && controller.nodeAttackDelay > 0) {
      game.aiNodeAttackCooldown.set(node.id, controller.nodeAttackDelay);
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
  let totalAiNodes = 0;
  let leadingFaction = null;
  let leadingCount = 0;
  /** @type {Map<Faction, number>} */
  const aiCounts = new Map();

  for (const node of game.nodes.values()) {
    if (node.owner === 'player') {
      playerNodes += 1;
    } else if (isAiFaction(node.owner)) {
      totalAiNodes += 1;
      const updated = (aiCounts.get(node.owner) ?? 0) + 1;
      aiCounts.set(node.owner, updated);
      if (updated > leadingCount) {
        leadingCount = updated;
        leadingFaction = node.owner;
      }
    }
  }

  if (totalAiNodes === 0 && playerNodes > 0) {
    game.setWinner('player');
    return;
  }

  if (playerNodes === 0 && totalAiNodes > 0 && leadingFaction) {
    game.setWinner(leadingFaction);
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
