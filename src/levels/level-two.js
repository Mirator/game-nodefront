/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - First Steps',
  width: 1280,
  height: 720,
  seed: 2077,
  nodes: [
    { id: 'n1', type: 'large', x: 240, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 360, y: 220, owner: 'player', energy: 90 },
    { id: 'n3', type: 'small', x: 360, y: 500, owner: 'player', energy: 75 },
    { id: 'n4', type: 'small', x: 520, y: 180, owner: 'neutral', energy: 55 },
    { id: 'n5', type: 'medium', x: 560, y: 360, owner: 'neutral', energy: 85 },
    { id: 'n6', type: 'small', x: 520, y: 540, owner: 'neutral', energy: 55 },
    { id: 'n7', type: 'medium', x: 840, y: 280, owner: 'ai', energy: 80 },
    { id: 'n8', type: 'medium', x: 880, y: 460, owner: 'ai', energy: 80 },
    { id: 'n9', type: 'small', x: 1020, y: 360, owner: 'ai', energy: 60 },
  ],
};
