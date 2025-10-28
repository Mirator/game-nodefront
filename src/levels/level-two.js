/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - Neutral Grounds',
  width: 1280,
  height: 720,
  seed: 2077,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 140 },
    neutral: { small: 55 },
    'ai-red': { small: 65 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 280, y: 360, owner: 'player' },
    { id: 'n2', type: 'small', x: 540, y: 280, owner: 'neutral' },
    { id: 'n3', type: 'small', x: 540, y: 440, owner: 'neutral' },
    { id: 'n4', type: 'small', x: 940, y: 360, owner: 'ai-red' },
  ],
};
