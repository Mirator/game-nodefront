/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - Neutral Grounds',
  width: 1280,
  height: 720,
  seed: 2077,
  nodes: [
    { id: 'n1', type: 'large', x: 280, y: 360, owner: 'player', energy: 140 },
    { id: 'n2', type: 'small', x: 520, y: 240, owner: 'neutral', energy: 55 },
    { id: 'n3', type: 'small', x: 520, y: 480, owner: 'neutral', energy: 55 },
    { id: 'n4', type: 'medium', x: 720, y: 360, owner: 'neutral', energy: 80 },
    { id: 'n5', type: 'medium', x: 960, y: 360, owner: 'ai', energy: 90 },
  ],
};
