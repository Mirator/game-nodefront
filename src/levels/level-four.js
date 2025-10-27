/** @type {import('../types.js').LevelDefinition} */
export const levelFour = {
  id: 'flowgrid-level-4',
  name: 'Level 4 - Steady Advance',
  width: 1280,
  height: 720,
  seed: 4242,
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 360, owner: 'player', energy: 150 },
    { id: 'n2', type: 'medium', x: 340, y: 180, owner: 'player', energy: 90 },
    { id: 'n3', type: 'medium', x: 340, y: 540, owner: 'player', energy: 90 },
    { id: 'n4', type: 'small', x: 460, y: 360, owner: 'player', energy: 70 },
    { id: 'n5', type: 'small', x: 560, y: 160, owner: 'neutral', energy: 55 },
    { id: 'n6', type: 'medium', x: 620, y: 280, owner: 'neutral', energy: 80 },
    { id: 'n7', type: 'medium', x: 620, y: 440, owner: 'neutral', energy: 80 },
    { id: 'n8', type: 'small', x: 560, y: 560, owner: 'neutral', energy: 55 },
    { id: 'n9', type: 'medium', x: 840, y: 260, owner: 'ai', energy: 90 },
    { id: 'n10', type: 'medium', x: 840, y: 460, owner: 'ai', energy: 90 },
    { id: 'n11', type: 'large', x: 980, y: 360, owner: 'ai', energy: 135 },
    { id: 'n12', type: 'small', x: 1100, y: 360, owner: 'ai', energy: 65 },
  ],
};
