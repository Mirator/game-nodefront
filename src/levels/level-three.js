/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Broken Line',
  width: 1500,
  height: 900,
  seed: 6391,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 155, medium: 80 },
    neutral: { small: 18, medium: 30 },
    'ai-red': { large: 140, medium: 85 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 320, y: 640, owner: 'player' },
    { id: 'n2', type: 'medium', x: 420, y: 340, owner: 'player' },
    { id: 'n3', type: 'medium', x: 420, y: 820, owner: 'player' },
    { id: 'n4', type: 'medium', x: 720, y: 260, owner: 'neutral' },
    { id: 'n5', type: 'small', x: 760, y: 560, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 720, y: 780, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 1080, y: 360, owner: 'ai-red' },
    { id: 'n8', type: 'large', x: 1220, y: 660, owner: 'ai-red' },
  ],
};
