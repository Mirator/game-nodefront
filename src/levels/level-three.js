/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Small Push',
  width: 1280,
  height: 720,
  seed: 3141,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 150, medium: 90 },
    neutral: { medium: 75 },
    'ai-red': { large: 125 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 380, y: 260, owner: 'player' },
    { id: 'n3', type: 'medium', x: 380, y: 460, owner: 'player' },
    { id: 'n4', type: 'medium', x: 600, y: 420, owner: 'neutral' },
    { id: 'n5', type: 'large', x: 920, y: 360, owner: 'ai-red' },
  ],
};
