/** @type {import('../types.js').LevelDefinition} */
export const levelSix = {
  id: 'flowgrid-level-6',
  name: 'Level 6 - Dry Riverbed',
  width: 1500,
  height: 900,
  seed: 9206,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 180, medium: 120, small: 70 },
    neutral: { small: 10, medium: 18, large: 30 },
    'ai-red': { large: 160, medium: 125, small: 80 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 700, owner: 'player' },
    { id: 'n2', type: 'medium', x: 400, y: 420, owner: 'player' },
    { id: 'n3', type: 'medium', x: 400, y: 860, owner: 'player' },
    { id: 'n4', type: 'small', x: 500, y: 580, owner: 'player' },
    { id: 'n5', type: 'small', x: 660, y: 160, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 740, y: 320, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 780, y: 520, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 720, y: 780, owner: 'neutral' },
    { id: 'n9', type: 'large', x: 960, y: 200, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 1120, y: 340, owner: 'ai-red' },
    { id: 'n11', type: 'large', x: 1300, y: 720, owner: 'ai-red' },
    { id: 'n12', type: 'small', x: 1200, y: 520, owner: 'ai-red' },
  ],
};
