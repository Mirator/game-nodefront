/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Small Push',
  width: 1280,
  height: 720,
  seed: 3141,
  nodes: [
    { id: 'n1', type: 'large', x: 240, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 360, y: 220, owner: 'player', energy: 90 },
    { id: 'n3', type: 'medium', x: 360, y: 500, owner: 'player', energy: 90 },
    { id: 'n4', type: 'small', x: 560, y: 160, owner: 'neutral', energy: 50 },
    { id: 'n5', type: 'medium', x: 600, y: 320, owner: 'neutral', energy: 80 },
    { id: 'n6', type: 'medium', x: 600, y: 500, owner: 'neutral', energy: 80 },
    { id: 'n7', type: 'small', x: 720, y: 360, owner: 'neutral', energy: 60 },
    { id: 'n8', type: 'large', x: 900, y: 360, owner: 'ai', energy: 130 },
    { id: 'n9', type: 'medium', x: 1020, y: 220, owner: 'ai', energy: 85 },
    { id: 'n10', type: 'medium', x: 1020, y: 500, owner: 'ai', energy: 85 },
  ],
};
