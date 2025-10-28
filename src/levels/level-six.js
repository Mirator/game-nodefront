/** @type {import('../types.js').LevelDefinition} */
export const levelSix = {
  id: 'flowgrid-level-6',
  name: 'Level 6 - Crossing Paths',
  width: 1280,
  height: 720,
  seed: 6060,
  aiStrategyId: 'neutral-simple',
  initialEnergy: {
    player: { large: 155, medium: 95, small: 70 },
    neutral: { small: 55, medium: 80 },
    'ai-red': { medium: 85, large: 130 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 320, y: 260, owner: 'player' },
    { id: 'n3', type: 'medium', x: 320, y: 460, owner: 'player' },
    { id: 'n4', type: 'small', x: 440, y: 360, owner: 'player' },
    { id: 'n5', type: 'small', x: 540, y: 220, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 580, y: 320, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 580, y: 400, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 540, y: 500, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 820, y: 260, owner: 'ai-red' },
    { id: 'n10', type: 'medium', x: 820, y: 460, owner: 'ai-red' },
    { id: 'n11', type: 'large', x: 940, y: 360, owner: 'ai-red' },
  ],
};
