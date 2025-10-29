/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Ridge Clash',
  width: 1500,
  height: 900,
  seed: 8342,
  aiStrategyId: 'neutral-simple',
  initialEnergy: {
    player: { large: 165, medium: 100 },
    neutral: { small: 12, medium: 36, large: 30 },
    'ai-red': { large: 155, medium: 110 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 540, owner: 'player' },
    { id: 'n2', type: 'medium', x: 420, y: 320, owner: 'player' },
    { id: 'n3', type: 'medium', x: 420, y: 760, owner: 'player' },
    { id: 'n4', type: 'small', x: 600, y: 260, owner: 'neutral' },
    { id: 'n5', type: 'medium', x: 700, y: 440, owner: 'neutral' },
    { id: 'n6', type: 'small', x: 600, y: 720, owner: 'neutral' },
    { id: 'n7', type: 'large', x: 900, y: 420, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 1040, y: 260, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 1120, y: 220, owner: 'ai-red' },
    { id: 'n10', type: 'medium', x: 1220, y: 640, owner: 'ai-red' },
    { id: 'n11', type: 'large', x: 1340, y: 420, owner: 'ai-red' },
  ],
};
