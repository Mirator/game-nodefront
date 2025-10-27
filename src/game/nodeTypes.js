export const NODE_TYPES = {
  small: {
    capacity: 80,
    regen: 4,
    radius: 12,
  },
  medium: {
    capacity: 110,
    regen: 6,
    radius: 18,
  },
  large: {
    capacity: 150,
    regen: 8,
    radius: 26,
  },
};

export const DEFAULT_NODE_TYPE = 'medium';

/**
 * @param {keyof typeof NODE_TYPES | undefined} type
 */
export function resolveNodeType(type) {
  if (!type) return NODE_TYPES[DEFAULT_NODE_TYPE];
  const config = NODE_TYPES[type];
  if (!config) {
    throw new Error(`Unknown node type: ${type}`);
  }
  return config;
}
