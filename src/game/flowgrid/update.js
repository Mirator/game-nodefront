/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').Faction} Faction */

import {
  LINK_BUILD_SPEED,
  LINK_DASH_CYCLE,
  LINK_DASH_SPEED,
} from '../constants.js';
import { clamp } from '../math.js';
import { captureNode } from './victory.js';
import { processAiActionQueue } from './ai.js';

/**
 * @param {FlowgridGame} game
 * @param {number} dt
 */
export function update(game, dt) {
  game.elapsedTime += dt;

  if (game.aiNodeAttackCooldown.size > 0) {
    for (const [nodeId, remaining] of [...game.aiNodeAttackCooldown.entries()]) {
      const updated = remaining - dt;
      if (updated <= 0) {
        game.aiNodeAttackCooldown.delete(nodeId);
      } else {
        game.aiNodeAttackCooldown.set(nodeId, updated);
      }
    }
  }

  processAiActionQueue(game);

  const regenMultiplier = game.config.regenRateMultiplier ?? 1;
  for (const node of game.nodes.values()) {
    node.energy = Math.min(node.capacity, node.energy + node.regen * dt * regenMultiplier);
  }

  for (const link of game.links.values()) {
    if (!link.establishing) continue;
    const progress = link.buildProgress + LINK_BUILD_SPEED * dt;
    if (progress >= link.length || link.length === 0) {
      link.buildProgress = link.length;
      link.establishing = false;
    } else {
      link.buildProgress = progress;
    }
  }

  /** @type {Record<string, Faction | null>} */
  const aggressor = {};

  for (const [nodeId, outgoing] of game.outgoingByNode) {
    const node = game.nodes.get(nodeId);
    if (!node) continue;
    if (outgoing.length === 0) continue;
    if (node.energy <= node.safetyReserve) {
      for (const link of outgoing) {
        link.smoothedRate *= 0.8;
      }
      continue;
    }

    const available = Math.max(0, node.energy - node.safetyReserve);
    if (available <= 0) continue;

    const shareSum = outgoing.reduce((acc, link) => (link.establishing ? acc : acc + link.share), 0);
    if (shareSum <= 0) {
      for (const link of outgoing) {
        link.smoothedRate *= 0.8;
      }
      continue;
    }

    for (const link of outgoing) {
      if (link.establishing) {
        link.smoothedRate = link.smoothedRate * 0.8;
        continue;
      }
      const shareFraction = link.share / shareSum;
      const intendedRate = available * shareFraction;
      const rate = Math.min(link.maxRate, intendedRate);
      const transfer = rate * dt;
      if (transfer <= 0) {
        link.smoothedRate = link.smoothedRate * 0.8;
        continue;
      }

      const target = game.nodes.get(link.targetId);
      if (!target) continue;

      let actualTransfer = transfer;
      let delivered = transfer * link.efficiency;

      if (target.owner === link.owner) {
        const capacityRemaining = Math.max(0, target.capacity - target.energy);
        if (capacityRemaining <= 0) {
          link.smoothedRate = link.smoothedRate * 0.8;
          continue;
        }
        if (delivered > capacityRemaining) {
          delivered = capacityRemaining;
          actualTransfer = link.efficiency > 0 ? delivered / link.efficiency : 0;
        }
        target.energy = Math.min(target.capacity, target.energy + delivered);
      } else {
        const defenderEnergyBefore = target.energy;
        target.energy = Math.max(0, target.energy - delivered);
        if (defenderEnergyBefore > 0 && target.energy <= 0 && !aggressor[target.id]) {
          aggressor[target.id] = link.owner;
        }
      }

      if (actualTransfer > 0) {
        node.energy = Math.max(0, node.energy - actualTransfer);
      }

      const actualRate = dt > 0 ? actualTransfer / dt : 0;
      link.smoothedRate = link.smoothedRate * 0.8 + actualRate * 0.2;
    }
  }

  for (const link of game.links.values()) {
    if (link.establishing) {
      link.dashOffset = 0;
      continue;
    }
    const normalized = link.maxRate > 0 ? clamp(link.smoothedRate / link.maxRate, 0, 1) : 0;
    if (normalized <= 0.01) {
      link.smoothedRate = 0;
      link.dashOffset = 0;
      continue;
    }

    const delta = normalized * LINK_DASH_SPEED * dt;
    link.dashOffset -= delta;
    if (link.dashOffset <= -LINK_DASH_CYCLE) {
      link.dashOffset += LINK_DASH_CYCLE;
    }
  }

  for (const node of game.nodes.values()) {
    if (node.energy <= 0) {
      const faction = aggressor[node.id];
      if (faction) {
        captureNode(game, node, faction);
      }
    }
  }

  game.aiCooldown -= dt;
  if (game.aiCooldown <= 0 && !game.winner) {
    game.runAiTurn();
    game.aiCooldown = game.aiTurnInterval;
  }

  game.checkVictory();
}
