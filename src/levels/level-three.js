/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Small Push',
  width: 1280,
  height: 720,
  seed: 3141,
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 380, y: 260, owner: 'player', energy: 90 },
    { id: 'n3', type: 'medium', x: 380, y: 460, owner: 'player', energy: 90 },
    { id: 'n4', type: 'small', x: 560, y: 300, owner: 'neutral', energy: 55 },
    { id: 'n5', type: 'medium', x: 600, y: 420, owner: 'neutral', energy: 75 },
    { id: 'n6', type: 'small', x: 760, y: 320, owner: 'ai', energy: 70 },
    { id: 'n7', type: 'large', x: 920, y: 360, owner: 'ai', energy: 125 },
  ],
};
