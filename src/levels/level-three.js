/** @type {import('../types.js').LevelDefinition} */
export const levelThree = {
  id: 'flowgrid-level-3',
  name: 'Level 3 - Encirclement',
  width: 1280,
  height: 720,
  seed: 3189,
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 360, owner: 'player', energy: 120 },
    { id: 'n2', type: 'medium', x: 320, y: 200, owner: 'player', energy: 85 },
    { id: 'n3', type: 'medium', x: 320, y: 520, owner: 'player', energy: 85 },
    { id: 'n4', type: 'small', x: 460, y: 120, owner: 'neutral', energy: 60 },
    { id: 'n5', type: 'small', x: 460, y: 600, owner: 'neutral', energy: 65 },
    { id: 'n6', type: 'medium', x: 560, y: 320, owner: 'neutral', energy: 90 },
    { id: 'n7', type: 'medium', x: 660, y: 180, owner: 'ai', energy: 115 },
    { id: 'n8', type: 'medium', x: 660, y: 460, owner: 'ai', energy: 120 },
    { id: 'n9', type: 'small', x: 780, y: 320, owner: 'ai', energy: 110 },
    { id: 'n10', type: 'large', x: 920, y: 220, owner: 'ai', energy: 155 },
    { id: 'n11', type: 'large', x: 1040, y: 420, owner: 'ai', energy: 165 },
  ],
};
