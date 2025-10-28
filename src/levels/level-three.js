/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Broken Line',
  width: 1500,
  height: 900,
  seed: 6391,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 170, medium: 105 },
    neutral: { small: 24, medium: 38 },
    'ai-red': { large: 145, medium: 110 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 320, y: 640, owner: 'player' },
    { id: 'n2', type: 'medium', x: 460, y: 360, owner: 'player' },
    { id: 'n3', type: 'medium', x: 460, y: 780, owner: 'player' },
    { id: 'n4', type: 'medium', x: 720, y: 220, owner: 'neutral' },
    { id: 'n5', type: 'small', x: 780, y: 520, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 720, y: 760, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 1060, y: 320, owner: 'ai-red' },
    { id: 'n8', type: 'large', x: 1240, y: 660, owner: 'ai-red' },
  ],
};
