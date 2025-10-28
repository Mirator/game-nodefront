/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - Forked Approach',
  width: 1500,
  height: 900,
  seed: 5129,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 165 },
    neutral: { small: 30 },
    'ai-red': { small: 55 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 360, y: 460, owner: 'player' },
    { id: 'n2', type: 'small', x: 750, y: 460, owner: 'neutral' },
    { id: 'n3', type: 'small', x: 1120, y: 460, owner: 'ai-red' },
  ],
};
