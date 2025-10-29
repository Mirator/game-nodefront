/** @type {import('../types.js').LevelDefinition} */
export const levelFour = {
  id: 'flowgrid-level-4',
  name: 'Level 4 - Dry Fields',
  width: 1500,
  height: 900,
  seed: 7244,
  aiStrategyId: 'neutral-simple',
  initialEnergy: {
    player: { large: 160, medium: 90 },
    neutral: { small: 12, medium: 30 },
    'ai-red': { large: 150, medium: 95 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 660, owner: 'player' },
    { id: 'n2', type: 'medium', x: 380, y: 320, owner: 'player' },
    { id: 'n3', type: 'medium', x: 380, y: 820, owner: 'player' },
    { id: 'n4', type: 'medium', x: 620, y: 260, owner: 'neutral' },
    { id: 'n5', type: 'small', x: 640, y: 520, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 620, y: 780, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 860, y: 360, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 880, y: 660, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 1100, y: 320, owner: 'ai-red' },
    { id: 'n10', type: 'large', x: 1260, y: 700, owner: 'ai-red' },
  ],
};
