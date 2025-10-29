/** @type {import('../types.js').LevelDefinition} */
export const levelEight = {
  id: 'flowgrid-level-8',
  name: 'Level 8 - Skewed Front',
  width: 1500,
  height: 900,
  seed: 11480,
  aiStrategyId: 'aggressive-simple',
  initialEnergy: {
    player: { large: 175, medium: 115, small: 55 },
    neutral: { small: 20, medium: 36, large: 20 },
    'ai-red': { large: 170, medium: 130, small: 35 },
  },
  nodes: [
    { id: 'n1', type: 'large', x: 220, y: 720, owner: 'player' },
    { id: 'n2', type: 'medium', x: 360, y: 420, owner: 'player' },
    { id: 'n3', type: 'medium', x: 360, y: 860, owner: 'player' },
    { id: 'n4', type: 'small', x: 480, y: 560, owner: 'player' },
    { id: 'n5', type: 'small', x: 520, y: 200, owner: 'neutral' },
    { id: 'n6', type: 'medium', x: 720, y: 260, owner: 'neutral' },
    { id: 'n7', type: 'medium', x: 860, y: 420, owner: 'neutral' },
    { id: 'n8', type: 'small', x: 760, y: 720, owner: 'neutral' },
    { id: 'n9', type: 'large', x: 980, y: 220, owner: 'neutral' },
    { id: 'n10', type: 'medium', x: 1120, y: 360, owner: 'ai-red' },
    { id: 'n11', type: 'medium', x: 1240, y: 620, owner: 'ai-red' },
    { id: 'n12', type: 'large', x: 1340, y: 420, owner: 'ai-red' },
  ],
};
