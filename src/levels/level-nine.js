/** @type {import('../types.js').LevelDefinition} */
export const levelNine = {
  id: 'flowgrid-level-9',
  name: 'Level 9 - Eroded Coast',
  width: 1500,
  height: 900,
  seed: 12691,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 195, medium: 135, small: 85 },
    neutral: { small: 20, medium: 36, large: 55 },
    'ai-red': { large: 190, medium: 145, small: 95 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 760, owner: 'player' },
    { id: 'n2', type: 'medium', x: 360, y: 520, owner: 'player' },
    { id: 'n3', type: 'medium', x: 360, y: 880, owner: 'player' },
    { id: 'n4', type: 'small', x: 460, y: 640, owner: 'player' },
    { id: 'n5', type: 'small', x: 540, y: 260, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 720, y: 160, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 780, y: 540, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 640, y: 780, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 880, y: 700, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 1100, y: 260, owner: 'ai-red' },
    { id: 'n11', type: 'medium', x: 1180, y: 620, owner: 'ai-red' },
    { id: 'n12', type: 'large', x: 1340, y: 420, owner: 'ai-red' },
    { id: 'n13', type: 'small', x: 1260, y: 780, owner: 'ai-red' },
  ],
};
