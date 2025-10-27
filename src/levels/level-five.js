/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Last Stand',
  width: 1280,
  height: 720,
  seed: 5891,
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 110 },
    { id: 'n2', type: 'medium', x: 300, y: 200, owner: 'player', energy: 80 },
    { id: 'n3', type: 'medium', x: 300, y: 520, owner: 'player', energy: 80 },
    { id: 'n4', type: 'small', x: 420, y: 140, owner: 'neutral', energy: 55 },
    { id: 'n5', type: 'small', x: 420, y: 580, owner: 'neutral', energy: 60 },
    { id: 'n6', type: 'medium', x: 520, y: 280, owner: 'neutral', energy: 85 },
    { id: 'n7', type: 'medium', x: 520, y: 440, owner: 'neutral', energy: 85 },
    { id: 'n8', type: 'small', x: 640, y: 200, owner: 'ai', energy: 120 },
    { id: 'n9', type: 'small', x: 640, y: 520, owner: 'ai', energy: 120 },
    { id: 'n10', type: 'medium', x: 760, y: 120, owner: 'ai', energy: 135 },
    { id: 'n11', type: 'medium', x: 760, y: 600, owner: 'ai', energy: 140 },
    { id: 'n12', type: 'large', x: 900, y: 240, owner: 'ai', energy: 170 },
    { id: 'n13', type: 'large', x: 1020, y: 420, owner: 'ai', energy: 185 },
  ],
};
