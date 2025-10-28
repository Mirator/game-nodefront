/** @type {import('../types.js').LevelDefinition} */
export const levelSix = {
  id: 'flowgrid-level-6',
  name: 'Level 6 - Crossing Paths',
  width: 1280,
  height: 720,
  seed: 6060,
  aiStrategyId: 'neutral-simple',
  nodes: [
    { id: 'n1', type: 'large', x: 200, y: 360, owner: 'player', energy: 155 },
    { id: 'n2', type: 'medium', x: 320, y: 260, owner: 'player', energy: 95 },
    { id: 'n3', type: 'medium', x: 320, y: 460, owner: 'player', energy: 95 },
    { id: 'n4', type: 'small', x: 440, y: 360, owner: 'player', energy: 70 },
    { id: 'n5', type: 'small', x: 540, y: 220, owner: 'neutral', energy: 55 },
    { id: 'n6', type: 'medium', x: 580, y: 320, owner: 'neutral', energy: 80 },
    { id: 'n7', type: 'medium', x: 580, y: 400, owner: 'neutral', energy: 80 },
    { id: 'n8', type: 'small', x: 540, y: 500, owner: 'neutral', energy: 55 },
    { id: 'n9', type: 'medium', x: 820, y: 260, owner: 'ai', energy: 85 },
    { id: 'n10', type: 'medium', x: 820, y: 460, owner: 'ai', energy: 85 },
    { id: 'n11', type: 'large', x: 940, y: 360, owner: 'ai', energy: 130 },
  ],
};
