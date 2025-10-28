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
    neutral: { small: 28, medium: 40 },
    'ai-red': { large: 140, small: 55 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 300, y: 660, owner: 'player' },
    { id: 'n2', type: 'small', x: 520, y: 280, owner: 'neutral' },
    { id: 'n3', type: 'small', x: 640, y: 780, owner: 'neutral' },
    { id: 'n4', type: 'medium', x: 780, y: 180, owner: 'neutral' },
    { id: 'n5', type: 'large', x: 1230, y: 420, owner: 'ai-red' },
    { id: 'n6', type: 'small', x: 1180, y: 720, owner: 'ai-red' },
  ],
};
