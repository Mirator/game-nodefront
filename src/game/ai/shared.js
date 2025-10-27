import { clamp, distance } from '../math.js';

/**
 * @param {import('../FlowgridGame.js').FlowgridGame} game
 * @param {import('../../types.js').NodeState} source
 * @param {number} perLinkAllocation
 * @param {number} regenMultiplier
 */
export function starvesExistingLinks(game, source, perLinkAllocation, regenMultiplier) {
  const outgoing = game.outgoingByNode.get(source.id) ?? [];
  for (const link of outgoing) {
    const target = game.nodes.get(link.targetId);
    if (!target || target.owner === 'ai') {
      continue;
    }
    const effectiveRate = Math.min(link.maxRate, perLinkAllocation);
    const netRate = effectiveRate - target.regen * regenMultiplier;
    if (netRate <= 0) {
      return true;
    }
  }
  return false;
}

/**
 * @param {import('../FlowgridGame.js').FlowgridGame} game
 * @param {import('../../types.js').NodeState} source
 * @param {Iterable<import('../../types.js').NodeState>} candidates
 * @param {number} perLinkAllocation
 * @param {number} surplus
 * @param {number} regenMultiplier
 * @param {(args: {
 *   target: import('../../types.js').NodeState;
 *   length: number;
 *   captureTime: number;
 *   random: () => number;
 * }) => number} scoringFn
 * @param {{ random?: () => number }} [options]
 */
export function pickBestTarget(
  game,
  source,
  candidates,
  perLinkAllocation,
  surplus,
  regenMultiplier,
  scoringFn,
  options = {},
) {
  let best = null;
  const random = options.random ?? Math.random;

  for (const target of candidates) {
    if (target.id === source.id) continue;
    if (target.owner === 'ai') continue;

    const length = distance(source.x, source.y, target.x, target.y);
    const speedFactor = clamp(1 - length * game.config.distanceLoss, game.config.efficiencyFloor, 1);
    const maxRate = game.config.linkMaxRate * speedFactor;
    if (maxRate <= 0) continue;

    const potentialRate = Math.min(maxRate, perLinkAllocation);
    if (potentialRate <= 0) continue;

    const targetRegen = target.regen * regenMultiplier;
    const cooperatingLinks = (game.incomingByNode.get(target.id) ?? []).filter(
      (link) => link.owner === 'ai' && link.sourceId !== source.id,
    );
    const existingSupportRate = cooperatingLinks.reduce((acc, link) => {
      if (link.establishing) return acc;
      return acc + Math.max(0, link.smoothedRate);
    }, 0);

    const netRate = potentialRate + existingSupportRate - targetRegen;
    if (netRate <= 0) continue;

    const captureTime = target.energy / netRate;
    if (!Number.isFinite(captureTime) || captureTime <= 0) continue;

    const energyRequired = captureTime * potentialRate;
    const regenContribution = source.regen * regenMultiplier * captureTime;
    const availableBudget = surplus + regenContribution;
    const supporterCount = cooperatingLinks.length;
    const effectiveRequirement = supporterCount > 0 ? energyRequired / (supporterCount + 1) : energyRequired;
    if (effectiveRequirement > availableBudget) {
      continue;
    }

    const score = scoringFn({ target, length, captureTime, random });
    if (!best || score > best.score) {
      best = { target, score };
    }
  }

  return best?.target ?? null;
}
