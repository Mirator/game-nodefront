/** @type {import('../types.js').LevelDefinition} */
export const levelSeven = {
  id: 'flowgrid-level-7',
  name: 'Level 7 - Wide Front',
  width: 1280,
  height: 720,
  seed: 7070,
  aiStrategyId: 'neutral-simple',
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 160 },
    { id: 'n2', type: 'medium', x: 320, y: 240, owner: 'player', energy: 100 },
    { id: 'n3', type: 'medium', x: 320, y: 480, owner: 'player', energy: 100 },
    { id: 'n4', type: 'small', x: 420, y: 360, owner: 'player', energy: 70 },
    { id: 'n5', type: 'small', x: 540, y: 240, owner: 'neutral', energy: 55 },
    { id: 'n6', type: 'medium', x: 580, y: 340, owner: 'neutral', energy: 80 },
    { id: 'n7', type: 'medium', x: 580, y: 460, owner: 'neutral', energy: 80 },
    { id: 'n8', type: 'small', x: 540, y: 560, owner: 'neutral', energy: 55 },
    { id: 'n9', type: 'medium', x: 820, y: 260, owner: 'ai', energy: 90 },
    { id: 'n10', type: 'medium', x: 820, y: 460, owner: 'ai', energy: 90 },
    { id: 'n11', type: 'large', x: 960, y: 360, owner: 'ai', energy: 135 },
    { id: 'n12', type: 'medium', x: 1080, y: 360, owner: 'ai', energy: 95 },
  ],
};
