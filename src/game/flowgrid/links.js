/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').LinkState} LinkState */
/** @typedef {import('../../types.js').NodeState} NodeState */

import { clamp, distance, distanceToSegment } from '../math.js';

const LINK_FAILURE_MESSAGES = {
  duplicate: 'Route already exists.',
  self: "Can't route to the same node.",
  maxRoutes: 'Node is at max routes.',
};

const NODE_FLASH_DURATION = 0.6;
const POINTER_SHAKE_DURATION = 0.35;
const POINTER_SHAKE_MAGNITUDE = 6;
const FAILURE_PROMPT_DURATION = 1800;

/**
 * @param {FlowgridGame} game
 * @param {NodeState | null | undefined} source
 * @param {'duplicate' | 'self' | 'maxRoutes'} reason
 */
function signalLinkFailure(game, source, reason) {
  if (!source || source.owner !== 'player') return;

  source.flashDuration = NODE_FLASH_DURATION;
  source.flashTimer = NODE_FLASH_DURATION;

  if (game.pointer?.dragSource && game.pointer.dragSource.id === source.id) {
    game.pointer.shakeDuration = POINTER_SHAKE_DURATION;
    game.pointer.shakeTimer = POINTER_SHAKE_DURATION;
    game.pointer.shakeMagnitude = POINTER_SHAKE_MAGNITUDE;
    game.pointer.shakeSourceId = source.id;
    game.pointer.shakeTargetX = game.pointer.x;
    game.pointer.shakeTargetY = game.pointer.y;
  }

  const message = LINK_FAILURE_MESSAGES[reason];
  if (message) {
    game.showTemporaryPrompt(message, 'warning', FAILURE_PROMPT_DURATION);
  }
}

/**
 * @param {FlowgridGame} game
 * @param {number} x
 * @param {number} y
 * @returns {NodeState | null}
 */
export function hitTestNode(game, x, y) {
  for (const node of Array.from(game.nodes.values()).reverse()) {
    const dist = distance(x, y, node.x, node.y);
    const hitPadding = Math.max(6, Math.round(node.radius * 0.3));
    if (dist <= node.radius + hitPadding) {
      return node;
    }
  }
  return null;
}

/**
 * @param {FlowgridGame} game
 */
export function deleteLinkAtPointer(game) {
  /** @type {{ link: LinkState; dist: number } | null} */
  let closest = null;
  for (const link of game.links.values()) {
    if (link.owner !== 'player') continue;
    const source = game.nodes.get(link.sourceId);
    const target = game.nodes.get(link.targetId);
    if (!source || !target) continue;
    const ratio = link.length > 0 ? clamp(link.buildProgress / link.length, 0, 1) : 1;
    const endX = source.x + (target.x - source.x) * ratio;
    const endY = source.y + (target.y - source.y) * ratio;
    const dist = distanceToSegment(game.pointer.x, game.pointer.y, source.x, source.y, endX, endY);
    if (dist < 18 && (!closest || dist < closest.dist)) {
      closest = { link, dist };
    }
  }
  if (closest) {
    game.removeLink(closest.link.id);
  }
}

/**
 * @param {FlowgridGame} game
 * @param {string} sourceId
 * @param {string} targetId
 */
export function createLink(game, sourceId, targetId) {
  const source = game.nodes.get(sourceId);
  const target = game.nodes.get(targetId);
  if (!source || !target) return;

  if (game.winner) return;

  if (source.owner !== 'player' && source.owner !== 'ai') return;
  if (source.owner === 'player' && game.winner) return;

  if (source.owner === 'ai') {
    const remaining = game.aiNodeAttackCooldown.get(sourceId);
    if (remaining && remaining > 0) {
      return;
    }
  }

  if (source.owner === 'player' && game.paused) return;

  if (sourceId === targetId) {
    signalLinkFailure(game, source, 'self');
    return;
  }
  if (game.links.has(`${sourceId}->${targetId}`)) {
    signalLinkFailure(game, source, 'duplicate');
    return;
  }

  const length = distance(source.x, source.y, target.x, target.y);

  const outgoing = game.outgoingByNode.get(sourceId);
  if (!outgoing) return;
  if (outgoing.length >= source.outgoingLimit) {
    signalLinkFailure(game, source, 'maxRoutes');
    return;
  }

  const speedFactor = clamp(1 - length * game.config.distanceLoss, game.config.efficiencyFloor, 1);

  /** @type {LinkState} */
  const link = {
    id: `${sourceId}->${targetId}`,
    sourceId,
    targetId,
    share: 1,
    length,
    efficiency: 1,
    owner: source.owner,
    maxRate: game.config.linkMaxRate * speedFactor,
    smoothedRate: 0,
    dashOffset: 0,
    buildProgress: 0,
    establishing: true,
  };

  game.links.set(link.id, link);
  outgoing.push(link);
  game.incomingByNode.get(targetId)?.push(link);

  const updatedOutgoing = game.outgoingByNode.get(sourceId) ?? [];
  const equalShare = 1 / updatedOutgoing.length;
  for (const existing of updatedOutgoing) {
    existing.share = equalShare;
  }
  link.share = equalShare;
  if (source.owner === 'ai' && game.aiNodeAttackDelay > 0) {
    game.aiNodeAttackCooldown.set(sourceId, game.aiNodeAttackDelay);
  }
}

/**
 * @param {FlowgridGame} game
 * @param {string} id
 */
export function removeLink(game, id) {
  const link = game.links.get(id);
  if (!link) return;
  const outgoing = game.outgoingByNode.get(link.sourceId);
  if (outgoing) {
    const index = outgoing.indexOf(link);
    if (index >= 0) {
      outgoing.splice(index, 1);
    }
    const count = outgoing.length;
    if (count > 0) {
      const equalShare = 1 / count;
      for (const existing of outgoing) {
        existing.share = equalShare;
      }
    }
  }
  const incoming = game.incomingByNode.get(link.targetId);
  if (incoming) {
    const index = incoming.indexOf(link);
    if (index >= 0) {
      incoming.splice(index, 1);
    }
  }
  link.dashOffset = 0;
  link.smoothedRate = 0;
  game.links.delete(id);
}
