/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').LinkState} LinkState */
/** @typedef {import('../../types.js').NodeState} NodeState */

import { clamp, distance, distanceToSegment } from '../math.js';

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

  if (sourceId === targetId) return;
  if (game.links.has(`${sourceId}->${targetId}`)) return;

  const length = distance(source.x, source.y, target.x, target.y);

  const outgoing = game.outgoingByNode.get(sourceId);
  if (!outgoing) return;
  if (outgoing.length >= source.outgoingLimit) {
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
  game.lastCreatedLink = link;

  if (source.owner === 'ai' && game.aiNodeAttackDelay > 0) {
    game.aiNodeAttackCooldown.set(sourceId, game.aiNodeAttackDelay);
  }
}

/**
 * @param {FlowgridGame} game
 * @param {LinkState} link
 * @param {number} fraction
 */
export function applySharePreset(game, link, fraction) {
  const sourceLinks = game.outgoingByNode.get(link.sourceId);
  if (!sourceLinks) return;
  if (!sourceLinks.includes(link)) return;

  const desired = clamp(fraction, 0.05, 1);
  const others = sourceLinks.filter((l) => l !== link);

  if (others.length === 0) {
    link.share = 1;
    return;
  }

  const remainingBudget = Math.max(0, 1 - desired);
  const previousShares = others.map((other) => other.share);
  const previousTotal = previousShares.reduce((acc, value) => acc + value, 0);

  link.share = desired;

  if (remainingBudget === 0) {
    for (const other of others) {
      other.share = 0;
    }
    return;
  }

  let assigned = 0;

  if (previousTotal > 0) {
    const scale = remainingBudget / previousTotal;
    for (let i = 0; i < others.length; i += 1) {
      const baseShare = previousShares[i] * scale;
      const isLast = i === others.length - 1;
      const newShare = isLast ? remainingBudget - assigned : baseShare;
      others[i].share = newShare;
      assigned += newShare;
    }
  } else {
    const evenShare = remainingBudget / others.length;
    for (let i = 0; i < others.length; i += 1) {
      const isLast = i === others.length - 1;
      const newShare = isLast ? remainingBudget - assigned : evenShare;
      others[i].share = newShare;
      assigned += newShare;
    }
  }

  const total = others.reduce((acc, other) => acc + other.share, link.share);
  const delta = 1 - total;
  if (Math.abs(delta) > Number.EPSILON) {
    const lastOther = others[others.length - 1];
    lastOther.share = clamp(lastOther.share + delta, 0, remainingBudget);
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
  if (game.lastCreatedLink?.id === id) {
    game.lastCreatedLink = null;
  }
}
