/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - Forked Approach',
  width: 1500,
  height: 900,
  seed: 5129,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 150 },
    neutral: { small: 40 },
    'ai-red': { large: 120 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 520, y: 450, owner: 'player' },
    { id: 'n2', type: 'small', x: 750, y: 450, owner: 'neutral' },
    { id: 'n3', type: 'large', x: 980, y: 450, owner: 'ai-red' },
  ],
};
