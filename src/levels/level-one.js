/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1 - First Contact',
  width: 1500,
  height: 900,
  seed: 4021,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 165 },
    'ai-red': { medium: 85 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 420, y: 460, owner: 'player' },
    { id: 'n2', type: 'medium', x: 1100, y: 460, owner: 'ai-red' },
  ],
};
