/** @type {import('../types.js').LevelDefinition} */
export const levelFour = {
  id: 'flowgrid-level-4',
  name: 'Level 4 - Dry Fields',
  width: 1500,
  height: 900,
  seed: 7244,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 170, medium: 110 },
    neutral: { small: 6, medium: 12 },
    'ai-red': { large: 150, medium: 115 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 660, owner: 'player' },
    { id: 'n2', type: 'medium', x: 380, y: 320, owner: 'player' },
    { id: 'n3', type: 'medium', x: 380, y: 820, owner: 'player' },
    { id: 'n4', type: 'small', x: 520, y: 200, owner: 'neutral' },
    { id: 'n5', type: 'medium', x: 620, y: 440, owner: 'neutral' },
    { id: 'n6', type: 'small', x: 520, y: 760, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 780, y: 260, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 840, y: 700, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 1100, y: 280, owner: 'ai-red' },
    { id: 'n10', type: 'large', x: 1280, y: 740, owner: 'ai-red' },
  ],
};
