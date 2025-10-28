export const FACTION_COLORS = {
  player: '#2563eb',
  'ai-red': '#dc2626',
  'ai-purple': '#7c3aed',
  neutral: '#9ca3af',
};

export const AI_FACTIONS = Object.freeze(['ai-red', 'ai-purple']);

export const FACTION_LABELS = Object.freeze({
  player: 'Player',
  'ai-red': 'Red AI',
  'ai-purple': 'Purple AI',
  neutral: 'Neutral',
});

/**
 * @param {import('../types.js').Faction | undefined} faction
 */
export function isAiFaction(faction) {
  return faction ? AI_FACTIONS.includes(faction) : false;
}

export const LINK_DASH_PATTERN = [12, 8];
export const LINK_DASH_CYCLE = LINK_DASH_PATTERN[0] + LINK_DASH_PATTERN[1];
export const LINK_DASH_SPEED = 60;
export const LINK_BUILD_SPEED = 280;
export const LINK_BUILD_DASH_PATTERN = [4, 12];
