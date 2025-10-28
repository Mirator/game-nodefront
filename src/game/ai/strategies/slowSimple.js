import { neutralSimple } from './neutralSimple.js';

/**
 * A deliberate variant of the neutral-focused strategy that relies on the
 * global timing configuration for its slower pacing.
 *
 * @param {import('../../FlowgridGame.js').FlowgridGame} game
 */
export function slowSimple(game) {
  neutralSimple(game);
}
