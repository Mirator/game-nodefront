/** @type {import('../types.js').LevelDefinition} */
export const levelFour = {
  id: 'flowgrid-level-4',
  name: 'Level 4 - Siege Line',
  width: 1280,
  height: 720,
  seed: 4261,
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 115 },
    { id: 'n2', type: 'medium', x: 300, y: 200, owner: 'player', energy: 85 },
    { id: 'n3', type: 'medium', x: 300, y: 520, owner: 'player', energy: 85 },
    { id: 'n4', type: 'small', x: 440, y: 160, owner: 'neutral', energy: 60 },
    { id: 'n5', type: 'small', x: 440, y: 560, owner: 'neutral', energy: 65 },
    { id: 'n6', type: 'medium', x: 520, y: 320, owner: 'neutral', energy: 90 },
    { id: 'n7', type: 'small', x: 600, y: 220, owner: 'ai', energy: 110 },
    { id: 'n8', type: 'small', x: 600, y: 440, owner: 'ai', energy: 110 },
    { id: 'n9', type: 'medium', x: 720, y: 120, owner: 'ai', energy: 130 },
    { id: 'n10', type: 'medium', x: 720, y: 600, owner: 'ai', energy: 135 },
    { id: 'n11', type: 'large', x: 880, y: 280, owner: 'ai', energy: 160 },
    { id: 'n12', type: 'large', x: 1040, y: 420, owner: 'ai', energy: 175 },
  ],
};
