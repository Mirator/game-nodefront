/** @type {import('../types.js').LevelDefinition} */
export const levelEight = {
  id: 'flowgrid-level-8',
  name: 'Level 8 - Skewed Front',
  width: 1500,
  height: 900,
  seed: 11480,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 190, medium: 130, small: 85 },
    neutral: { small: 22, medium: 38, large: 60 },
    'ai-red': { medium: 120, large: 170 },
    overrides: {
      n9: 50,
    },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 720, owner: 'player' },
    { id: 'n2', type: 'medium', x: 360, y: 420, owner: 'player' },
    { id: 'n3', type: 'medium', x: 360, y: 860, owner: 'player' },
    { id: 'n4', type: 'small', x: 480, y: 560, owner: 'player' },
    { id: 'n5', type: 'small', x: 520, y: 160, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 700, y: 280, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 820, y: 640, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 660, y: 820, owner: 'neutral' },
    { id: 'n9', type: 'large', x: 900, y: 140, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 1090, y: 280, owner: 'ai-red' },
    { id: 'n11', type: 'medium', x: 1180, y: 580, owner: 'ai-red' },
    { id: 'n12', type: 'large', x: 1320, y: 380, owner: 'ai-red' },
  ],
};
