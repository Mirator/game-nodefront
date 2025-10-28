/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Gentle Spread',
  width: 1280,
  height: 720,
  seed: 5150,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 150, medium: 95, small: 70 },
    neutral: { small: 55, medium: 85 },
    'ai-red': { medium: 90, large: 130 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 320, y: 240, owner: 'player' },
    { id: 'n3', type: 'medium', x: 320, y: 480, owner: 'player' },
    { id: 'n4', type: 'small', x: 420, y: 360, owner: 'player' },
    { id: 'n5', type: 'small', x: 560, y: 240, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 620, y: 360, owner: 'neutral' },
    { id: 'n7', type: 'small', x: 560, y: 480, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 820, y: 260, owner: 'ai-red' },
    { id: 'n9', type: 'medium', x: 820, y: 460, owner: 'ai-red' },
    { id: 'n10', type: 'large', x: 960, y: 360, owner: 'ai-red' },
  ],
};
