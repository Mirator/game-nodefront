/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Gentle Spread',
  width: 1280,
  height: 720,
  seed: 5150,
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 320, y: 240, owner: 'player', energy: 95 },
    { id: 'n3', type: 'medium', x: 320, y: 480, owner: 'player', energy: 95 },
    { id: 'n4', type: 'small', x: 420, y: 360, owner: 'player', energy: 70 },
    { id: 'n5', type: 'small', x: 560, y: 240, owner: 'neutral', energy: 55 },
    { id: 'n6', type: 'medium', x: 620, y: 360, owner: 'neutral', energy: 85 },
    { id: 'n7', type: 'small', x: 560, y: 480, owner: 'neutral', energy: 55 },
    { id: 'n8', type: 'medium', x: 820, y: 260, owner: 'ai', energy: 90 },
    { id: 'n9', type: 'medium', x: 820, y: 460, owner: 'ai', energy: 90 },
    { id: 'n10', type: 'large', x: 960, y: 360, owner: 'ai', energy: 130 },
  ],
};
