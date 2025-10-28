/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1 - Welcome',
  width: 1280,
  height: 720,
  seed: 1337,
  nodes: [
    { id: 'n1', type: 'large', x: 320, y: 360, owner: 'player', energy: 140 },
    { id: 'n2', type: 'small', x: 960, y: 360, owner: 'ai', energy: 40 },
  ],
};
