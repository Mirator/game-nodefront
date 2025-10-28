import { pickBestTarget, starvesExistingLinks } from '../shared.js';
import { distance } from '../../math.js';

/**
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 */
export function neutralSimple(game) {
  const regenMultiplier = game.config.regenRateMultiplier ?? 1;
  const allNodes = Array.from(game.nodes.values());
  const aiNodes = allNodes.filter((node) => node.owner === 'ai');
  const neutralNodes = allNodes.filter((node) => node.owner === 'neutral');
  const playerNodes = allNodes.filter((node) => node.owner === 'player');

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

    let nearestNeutralDistance = Infinity;
    if (neutralNodes.length > 0) {
      for (const neutral of neutralNodes) {
        const dist = distance(source.x, source.y, neutral.x, neutral.y);
        if (dist < nearestNeutralDistance) {
          nearestNeutralDistance = dist;
        }
      }
    }

    /** @type {import('../../types.js').NodeState[]} */
    const candidates = [];
    if (neutralNodes.length > 0) {
      candidates.push(...neutralNodes);
      const distanceGate = Number.isFinite(nearestNeutralDistance) ? nearestNeutralDistance : Infinity;
      for (const player of playerNodes) {
        const playerDistance = distance(source.x, source.y, player.x, player.y);
        if (playerDistance <= distanceGate * 1.15) {
          candidates.push(player);
        }
      }
    } else {
      candidates.push(...playerNodes);
    }

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
      ({ target, length, captureTime, random }) => {
        const incoming = game.incomingByNode.get(target.id) ?? [];
        const playerPressure = incoming.filter((link) => link.owner === 'player').length;
        const normalizedEnergy = target.capacity > 0 ? target.energy / target.capacity : 1;
        const timeWeight = 1 / captureTime;
        const randomFactor = 1 + (random() - 0.5) * 0.05;

        if (target.owner === 'neutral') {
          const distanceWeight = 1 / (1 + length / 90);
          const contestBonus = playerPressure > 0 ? 2 + playerPressure * 0.5 : 1;
          const vulnerability = 1 + (1 - Math.min(1, normalizedEnergy)) * 0.8;
          return (target.capacity + 20) * distanceWeight * timeWeight * contestBonus * vulnerability * randomFactor;
        }

        const distanceWeight = 1 / (1 + length / 120);
        const weakness = 1 + (1 - Math.min(1, normalizedEnergy)) * 1.4;
        const neutralBias = neutralNodes.length > 0 ? 0.9 : 1.25;
        return (target.capacity + 18) * distanceWeight * timeWeight * weakness * neutralBias * randomFactor;
      },
      { random: game.random },
    );

    if (!bestTarget) {
      continue;
    }

    game.queueAiLink(source.id, bestTarget.id);
  }
}
