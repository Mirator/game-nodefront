/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1 - Welcome',
  width: 1280,
  height: 720,
  seed: 1337,
  aiStrategyId: 'slow-simple',
  initialEnergy: {
    player: { large: 140 },
    ai: { small: 40 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 400, y: 360, owner: 'player' },
    { id: 'n2', type: 'small', x: 860, y: 360, owner: 'ai' },
  ],
};
