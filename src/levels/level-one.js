/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1 - First Contact',
  width: 1500,
  height: 900,
  seed: 4021,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 150 },
    'ai-red': { large: 60 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 420, y: 450, owner: 'player' },
    { id: 'n2', type: 'large', x: 1080, y: 450, owner: 'ai-red' },
  ],
};
