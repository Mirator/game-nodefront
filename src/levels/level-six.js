/** @type {import('../types.js').LevelDefinition} */
export const levelSix = {
  id: 'flowgrid-level-6',
  name: 'Level 6 - Crossing Paths',
  width: 1280,
  height: 720,
  seed: 6060,
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 155 },
    { id: 'n2', type: 'medium', x: 320, y: 240, owner: 'player', energy: 95 },
    { id: 'n3', type: 'medium', x: 320, y: 480, owner: 'player', energy: 95 },
    { id: 'n4', type: 'small', x: 440, y: 360, owner: 'player', energy: 70 },
    { id: 'n5', type: 'small', x: 540, y: 160, owner: 'neutral', energy: 55 },
    { id: 'n6', type: 'medium', x: 580, y: 260, owner: 'neutral', energy: 80 },
    { id: 'n7', type: 'medium', x: 600, y: 360, owner: 'neutral', energy: 80 },
    { id: 'n8', type: 'medium', x: 580, y: 460, owner: 'neutral', energy: 80 },
    { id: 'n9', type: 'small', x: 540, y: 560, owner: 'neutral', energy: 55 },
    { id: 'n10', type: 'small', x: 680, y: 360, owner: 'neutral', energy: 60 },
    { id: 'n11', type: 'medium', x: 820, y: 200, owner: 'ai', energy: 85 },
    { id: 'n12', type: 'medium', x: 820, y: 520, owner: 'ai', energy: 85 },
    { id: 'n13', type: 'large', x: 940, y: 360, owner: 'ai', energy: 130 },
    { id: 'n14', type: 'medium', x: 1080, y: 360, owner: 'ai', energy: 90 },
  ],
};
