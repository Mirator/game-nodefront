import { pickBestTarget, starvesExistingLinks } from '../shared.js';

/**
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 */
export function neutralSimple(game) {
  const regenMultiplier = game.config.regenRateMultiplier ?? 1;
  const aiNodes = Array.from(game.nodes.values()).filter((node) => node.owner === 'ai');
  const neutralNodes = Array.from(game.nodes.values()).filter((node) => node.owner === 'neutral');
  const fallbackTargets = Array.from(game.nodes.values()).filter((node) => node.owner === 'player');

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

    const candidates = neutralNodes.length > 0 ? neutralNodes : fallbackTargets;
    if (candidates.length === 0) {
      continue;
    }

    const bestTarget = pickBestTarget(
      game,
      source,
      candidates,
      perLinkAllocation,
      surplus,
      regenMultiplier,
      ({ target, length, captureTime }) => {
        if (target.owner === 'neutral') {
          return (target.capacity + 15) / (1 + length);
        }
        const urgencyWeight = 1 / captureTime;
        const proximityWeight = 1 / (1 + length / 120);
        return (target.capacity + 25) * urgencyWeight * proximityWeight;
      },
    );

    if (!bestTarget) {
      continue;
    }

    game.createLink(source.id, bestTarget.id);
  }
}
