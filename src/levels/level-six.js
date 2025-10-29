/** @type {import('../types.js').LevelDefinition} */
export const levelSix = {
  id: 'flowgrid-level-6',
  name: 'Level 6 - Dry Riverbed',
  width: 1500,
  height: 900,
  seed: 9206,
  aiStrategyId: 'neutral-simple',
  initialEnergy: {
    player: { large: 170, medium: 105, small: 40 },
    neutral: { small: 30, medium: 30 },
    'ai-red': { large: 160, medium: 120, small: 25 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 700, owner: 'player' },
    { id: 'n2', type: 'medium', x: 400, y: 420, owner: 'player' },
    { id: 'n3', type: 'medium', x: 400, y: 860, owner: 'player' },
    { id: 'n4', type: 'small', x: 480, y: 600, owner: 'player' },
    { id: 'n5', type: 'small', x: 620, y: 220, owner: 'neutral' },
    { id: 'n6', type: 'small', x: 700, y: 360, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 780, y: 480, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 720, y: 640, owner: 'neutral' },
    { id: 'n9', type: 'small', x: 820, y: 780, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 940, y: 360, owner: 'neutral' },
    { id: 'n11', type: 'medium', x: 1080, y: 540, owner: 'ai-red' },
    { id: 'n12', type: 'large', x: 1300, y: 720, owner: 'ai-red' },
    { id: 'n13', type: 'small', x: 1200, y: 440, owner: 'ai-red' },
  ],
};
