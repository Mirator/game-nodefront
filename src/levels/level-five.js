/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Ridge Clash',
  width: 1500,
  height: 900,
  seed: 8342,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 175, medium: 115 },
    neutral: { small: 18, medium: 34, large: 50 },
    'ai-red': { large: 155, medium: 120 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 540, owner: 'player' },
    { id: 'n2', type: 'medium', x: 420, y: 320, owner: 'player' },
    { id: 'n3', type: 'medium', x: 420, y: 760, owner: 'player' },
    { id: 'n4', type: 'medium', x: 640, y: 200, owner: 'neutral' },
    { id: 'n5', type: 'small', x: 720, y: 500, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 640, y: 800, owner: 'neutral' },
    { id: 'n7', type: 'large', x: 900, y: 420, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 1120, y: 220, owner: 'ai-red' },
    { id: 'n9', type: 'medium', x: 1220, y: 640, owner: 'ai-red' },
    { id: 'n10', type: 'large', x: 1340, y: 420, owner: 'ai-red' },
  ],
};
