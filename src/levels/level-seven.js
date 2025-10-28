/** @type {import('../types.js').LevelDefinition} */
export const levelSeven = {
  id: 'flowgrid-level-7',
  name: 'Level 7 - Canyon Split',
  width: 1500,
  height: 900,
  seed: 10087,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 185, medium: 125, small: 80 },
    neutral: { small: 18, medium: 32, large: 48 },
    'ai-red': { large: 170, medium: 130, small: 85 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 240, y: 680, owner: 'player' },
    { id: 'n2', type: 'medium', x: 380, y: 360, owner: 'player' },
    { id: 'n3', type: 'medium', x: 360, y: 840, owner: 'player' },
    { id: 'n4', type: 'small', x: 480, y: 560, owner: 'player' },
    { id: 'n5', type: 'small', x: 640, y: 220, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 700, y: 420, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 660, y: 760, owner: 'neutral' },
    { id: 'n8', type: 'large', x: 860, y: 160, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 940, y: 520, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 1100, y: 320, owner: 'ai-red' },
    { id: 'n11', type: 'large', x: 1300, y: 720, owner: 'ai-red' },
    { id: 'n12', type: 'medium', x: 1180, y: 560, owner: 'ai-red' },
  ],
};
