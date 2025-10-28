import { neutralSimple } from './neutralSimple.js';

/**
 * A deliberate variant of the neutral-focused strategy that relies on the
 * global timing configuration for its slower pacing.
 *
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 * @param {{ faction: import('../../../types.js').Faction }} context
 */
export function slowSimple(game, context) {
  neutralSimple(game, context);
}
