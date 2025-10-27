/** @type {import('../types.js').LevelDefinition} */
export const levelOne = {
  id: 'flowgrid-level-1',
  name: 'Level 1',
  width: 1280,
  height: 720,
  seed: 1337,
  nodes: [
    { id: 'n1', type: 'large', x: 260, y: 360, owner: 'player', energy: 130 },
    { id: 'n2', type: 'medium', x: 380, y: 220, owner: 'player', energy: 95 },
    { id: 'n3', type: 'small', x: 560, y: 160, owner: 'neutral', energy: 55 },
    { id: 'n4', type: 'medium', x: 620, y: 340, owner: 'neutral', energy: 85 },
    { id: 'n5', type: 'small', x: 540, y: 520, owner: 'neutral', energy: 60 },
    { id: 'n6', type: 'medium', x: 760, y: 240, owner: 'neutral', energy: 90 },
    { id: 'n7', type: 'large', x: 860, y: 420, owner: 'neutral', energy: 120 },
    { id: 'n8', type: 'large', x: 980, y: 280, owner: 'ai', energy: 140 },
    { id: 'n9', type: 'medium', x: 1060, y: 520, owner: 'ai', energy: 100 },
  ],
};
