const increaseRadiusByQuarter = (radius) => Math.round(radius + radius / 4);

export const NODE_TYPES = {
  small: {
    capacity: 80,
    regen: 4,
    radius: increaseRadiusByQuarter(12),
    outgoingLimit: 1,
  },
  medium: {
    capacity: 110,
    regen: 6,
    radius: increaseRadiusByQuarter(18),
    outgoingLimit: 2,
  },
  large: {
    capacity: 150,
    regen: 8,
    radius: increaseRadiusByQuarter(26),
    outgoingLimit: 3,
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
