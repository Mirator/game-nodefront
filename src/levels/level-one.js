/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1 - Welcome',
  width: 1280,
  height: 720,
  seed: 1337,
  nodes: [
    { id: 'n1', type: 'large', x: 240, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 380, y: 360, owner: 'player', energy: 80 },
    { id: 'n3', type: 'small', x: 600, y: 320, owner: 'neutral', energy: 45 },
    { id: 'n4', type: 'small', x: 860, y: 360, owner: 'ai', energy: 35 },
  ],
};
