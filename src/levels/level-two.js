/** @type {import('../types.js').LevelDefinition} */
export const levelTwo = {
  id: 'flowgrid-level-2',
  name: 'Level 2 - Escalation',
  width: 1280,
  height: 720,
  seed: 2077,
  nodes: [
    { id: 'n1', type: 'large', x: 210, y: 360, owner: 'player', energy: 125 },
    { id: 'n2', type: 'medium', x: 320, y: 220, owner: 'player', energy: 90 },
    { id: 'n3', type: 'small', x: 330, y: 500, owner: 'player', energy: 70 },
    { id: 'n4', type: 'small', x: 500, y: 160, owner: 'neutral', energy: 60 },
    { id: 'n5', type: 'medium', x: 520, y: 320, owner: 'neutral', energy: 85 },
    { id: 'n6', type: 'small', x: 520, y: 520, owner: 'neutral', energy: 70 },
    { id: 'n7', type: 'medium', x: 700, y: 220, owner: 'ai', energy: 110 },
    { id: 'n8', type: 'large', x: 820, y: 360, owner: 'ai', energy: 140 },
    { id: 'n9', type: 'medium', x: 940, y: 520, owner: 'ai', energy: 115 },
    { id: 'n10', type: 'large', x: 1060, y: 320, owner: 'ai', energy: 150 },
  ],
};
