/** @type {import('../types.js').LevelDefinition} */
export const levelEight = {
  id: 'flowgrid-level-8',
  name: 'Level 8 - Center Control',
  width: 1280,
  height: 720,
  seed: 8080,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 160, medium: 100, small: 75 },
    neutral: { small: 55, medium: 80 },
    ai: { medium: 95, large: 135 },
    overrides: {
      n9: 85,
    },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 180, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 300, y: 240, owner: 'player' },
    { id: 'n3', type: 'medium', x: 300, y: 480, owner: 'player' },
    { id: 'n4', type: 'small', x: 380, y: 360, owner: 'player' },
    { id: 'n5', type: 'small', x: 520, y: 220, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 560, y: 320, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 560, y: 420, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 520, y: 520, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 680, y: 360, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 900, y: 260, owner: 'ai' },
    { id: 'n11', type: 'medium', x: 900, y: 460, owner: 'ai' },
    { id: 'n12', type: 'large', x: 1020, y: 360, owner: 'ai' },
  ],
};
