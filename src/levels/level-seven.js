/** @type {import('../types.js').LevelDefinition} */
export const levelSeven = {
  id: 'flowgrid-level-7',
  name: 'Level 7 - Wide Front',
  width: 1280,
  height: 720,
  seed: 7070,
  aiStrategyId: 'neutral-simple',
  initialEnergy: {
    player: { large: 160, medium: 100, small: 70 },
    neutral: { small: 55, medium: 80 },
    ai: { medium: 90, large: 135 },
    overrides: {
      n12: 95,
    },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 320, y: 240, owner: 'player' },
    { id: 'n3', type: 'medium', x: 320, y: 480, owner: 'player' },
    { id: 'n4', type: 'small', x: 420, y: 360, owner: 'player' },
    { id: 'n5', type: 'small', x: 540, y: 240, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 580, y: 340, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 580, y: 460, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 540, y: 560, owner: 'neutral' },
    { id: 'n9', type: 'medium', x: 820, y: 260, owner: 'ai' },
    { id: 'n10', type: 'medium', x: 820, y: 460, owner: 'ai' },
    { id: 'n11', type: 'large', x: 960, y: 360, owner: 'ai' },
    { id: 'n12', type: 'medium', x: 1080, y: 360, owner: 'ai' },
  ],
};
