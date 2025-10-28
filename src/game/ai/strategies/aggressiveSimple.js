import { pickBestTarget, starvesExistingLinks } from '../shared.js';

/**
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 */
export function aggressiveSimple(game) {
  const regenMultiplier = game.config.regenRateMultiplier ?? 1;
  const allNodes = Array.from(game.nodes.values());
  const aiNodes = allNodes.filter((node) => node.owner === 'ai');
  const neutralCount = allNodes.reduce((count, node) => (node.owner === 'neutral' ? count + 1 : count), 0);
  for (const source of aiNodes) {
    const surplus = source.energy - source.safetyReserve;
    if (surplus < game.config.surplusThreshold) {
      game.trimAiLinksIfWeak(source);
      continue;
    }

    const outgoing = game.outgoingByNode.get(source.id) ?? [];
    if (outgoing.length >= source.outgoingLimit) {
      continue;
    }

    const shareCount = outgoing.length + 1;
    const perLinkAllocation = Math.min(surplus / shareCount, game.config.linkMaxRate);
    if (perLinkAllocation <= 0) {
      continue;
    }

    if (starvesExistingLinks(game, source, perLinkAllocation, regenMultiplier)) {
      continue;
    }

    const bestTarget = pickBestTarget(
      game,
      source,
      game.nodes.values(),
      perLinkAllocation,
      surplus,
      regenMultiplier,
      ({ target, length, captureTime, random }) => {
        const targetIsNeutral = target.owner === 'neutral';
        const targetIsPlayer = target.owner === 'player';
        const neutralsRemain = neutralCount > 0;

        const baseValue = target.capacity + (targetIsPlayer ? 18 : 24);
        const distanceScale = targetIsNeutral && neutralsRemain ? 70 : 110;
        const distanceWeight = 1 / (1 + length / distanceScale);

        const normalizedEnergy = target.capacity > 0 ? target.energy / target.capacity : 1;
        const weakness = targetIsPlayer
          ? 1 + (1 - Math.min(1, normalizedEnergy)) * 1.6
          : 1 + (1 - Math.min(1, normalizedEnergy)) * 0.6;

        let ownershipBias = 1;
        if (targetIsNeutral) {
          ownershipBias = neutralsRemain ? 2.6 : 1.3;
        } else if (targetIsPlayer) {
          ownershipBias = neutralsRemain ? 0.75 : 1.6;
        }

        const timeWeight = 1 / captureTime;
        const randomFactor = 1 + (random() - 0.5) * 0.05;

        return baseValue * distanceWeight * weakness * ownershipBias * timeWeight * randomFactor;
      },
      { random: game.random },
    );

    if (!bestTarget) {
      continue;
    }

    game.queueAiLink(source.id, bestTarget.id);
  }
}
