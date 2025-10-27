/** @type {import('../types.js').LevelDefinition} */
export const levelFive = {
  id: 'flowgrid-level-5',
  name: 'Level 5 - Gentle Spread',
  width: 1280,
  height: 720,
  seed: 5150,
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 320, y: 200, owner: 'player', energy: 95 },
    { id: 'n3', type: 'medium', x: 320, y: 520, owner: 'player', energy: 95 },
    { id: 'n4', type: 'small', x: 400, y: 120, owner: 'player', energy: 65 },
    { id: 'n5', type: 'small', x: 400, y: 600, owner: 'player', energy: 65 },
    { id: 'n6', type: 'small', x: 540, y: 200, owner: 'neutral', energy: 55 },
    { id: 'n7', type: 'small', x: 540, y: 520, owner: 'neutral', energy: 55 },
    { id: 'n8', type: 'medium', x: 620, y: 360, owner: 'neutral', energy: 85 },
    { id: 'n9', type: 'small', x: 700, y: 220, owner: 'neutral', energy: 60 },
    { id: 'n10', type: 'small', x: 700, y: 500, owner: 'neutral', energy: 60 },
    { id: 'n11', type: 'medium', x: 860, y: 200, owner: 'ai', energy: 90 },
    { id: 'n12', type: 'medium', x: 860, y: 520, owner: 'ai', energy: 90 },
    { id: 'n13', type: 'large', x: 980, y: 360, owner: 'ai', energy: 130 },
    { id: 'n14', type: 'medium', x: 1100, y: 360, owner: 'ai', energy: 95 },
  ],
};
