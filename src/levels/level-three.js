/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Broken Line',
  width: 1500,
  height: 900,
  seed: 6391,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 155 },
    neutral: { small: 18, medium: 30 },
    'ai-red': { large: 140 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 360, y: 560, owner: 'player' },
    { id: 'n2', type: 'medium', x: 720, y: 420, owner: 'neutral' },
    { id: 'n3', type: 'small', x: 720, y: 700, owner: 'neutral' },
    { id: 'n4', type: 'large', x: 1140, y: 560, owner: 'ai-red' },
  ],
};
