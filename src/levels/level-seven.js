/** @type {import('../types.js').LevelDefinition} */
export const levelSeven = {
  id: 'flowgrid-level-7',
  name: 'Level 7 - Canyon Split',
  width: 1500,
  height: 900,
  seed: 10087,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 170, medium: 110, small: 50 },
    neutral: { small: 24, medium: 32 },
    'ai-red': { large: 165, medium: 125, small: 30 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 240, y: 680, owner: 'player' },
    { id: 'n2', type: 'medium', x: 380, y: 360, owner: 'player' },
    { id: 'n3', type: 'medium', x: 360, y: 840, owner: 'player' },
    { id: 'n4', type: 'small', x: 480, y: 560, owner: 'player' },
    { id: 'n5', type: 'small', x: 580, y: 240, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 660, y: 420, owner: 'neutral' },
    { id: 'n7', type: 'small', x: 580, y: 720, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 660, y: 820, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 860, y: 280, owner: 'neutral' },
    { id: 'n10', type: 'small', x: 860, y: 580, owner: 'neutral' },
    { id: 'n11', type: 'medium', x: 1100, y: 360, owner: 'ai-red' },
    { id: 'n12', type: 'large', x: 1280, y: 720, owner: 'ai-red' },
    { id: 'n13', type: 'medium', x: 1160, y: 560, owner: 'ai-red' },
  ],
};
