/** @type {import('../types.js').LevelDefinition} */
export const levelFour = {
  id: 'flowgrid-level-4',
  name: 'Level 4 - Steady Advance',
  width: 1280,
  height: 720,
  seed: 4242,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 150, medium: 90, small: 70 },
    neutral: { small: 55, medium: 80 },
    ai: { medium: 90, large: 135 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 360, owner: 'player' },
    { id: 'n2', type: 'medium', x: 340, y: 200, owner: 'player' },
    { id: 'n3', type: 'medium', x: 340, y: 520, owner: 'player' },
    { id: 'n4', type: 'small', x: 440, y: 360, owner: 'player' },
    { id: 'n5', type: 'small', x: 560, y: 240, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 600, y: 360, owner: 'neutral' },
    { id: 'n7', type: 'small', x: 560, y: 480, owner: 'neutral' },
    { id: 'n8', type: 'medium', x: 820, y: 260, owner: 'ai' },
    { id: 'n9', type: 'medium', x: 820, y: 460, owner: 'ai' },
    { id: 'n10', type: 'large', x: 960, y: 360, owner: 'ai' },
  ],
};
