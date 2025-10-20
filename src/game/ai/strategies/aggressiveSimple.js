import { pickBestTarget, starvesExistingLinks } from '../shared.js';

/**
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 */
export function aggressiveSimple(game) {
  const regenMultiplier = game.config.regenRateMultiplier ?? 1;
  const aiNodes = Array.from(game.nodes.values()).filter((node) => node.owner === 'ai');
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
    const perLinkAllocation = surplus / shareCount;
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
      ({ target, length, captureTime }) => {
        const valueBonus = target.capacity + (target.owner === 'player' ? 40 : 0);
        const baseScore = valueBonus / captureTime;
        const distanceWeight = 1 / (1 + length / 100);
        const neutralMultiplier = target.owner === 'neutral' ? 1.1 : 1;
        const randomFactor = 1 + (Math.random() - 0.5) * 0.05;
        return baseScore * distanceWeight * neutralMultiplier * randomFactor;
      },
    );

    if (!bestTarget) {
      continue;
    }

    game.createLink(source.id, bestTarget.id);
  }
}
