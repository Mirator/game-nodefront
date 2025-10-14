/**
 * @typedef {'player' | 'ai' | 'neutral'} Faction
 */

/**
 * @typedef {Object} NodeDefinition
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {Faction} owner
 * @property {number} energy
 * @property {number} capacity
 * @property {number} regen
 * @property {number} radius
 */

/**
 * @typedef {Object} LevelDefinition
 * @property {string} id
 * @property {number} width
 * @property {number} height
 * @property {Array<NodeDefinition>} nodes
 * @property {number} seed
 */

/**
 * @typedef {NodeDefinition & {
 *   outgoingLimit: number;
 *   safetyReserve: number;
 *   energy: number;
 *   owner: Faction;
 * }} NodeState
 */

/**
 * @typedef {Object} LinkState
 * @property {string} id
 * @property {string} sourceId
 * @property {string} targetId
 * @property {number} share
 * @property {number} length
 * @property {number} efficiency
 * @property {Faction} owner
 * @property {number} maxRate
 * @property {number} smoothedRate
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} fixedStep
 * @property {number} maxLinkDistance
 * @property {number} distanceLoss
 * @property {number} efficiencyFloor
 * @property {number} captureSeed
 * @property {number} safetyReserve
 * @property {number} outgoingLimit
 * @property {number} linkMaxRate
 * @property {number} surplusThreshold
 * @property {Record<string, number>} sharePresets
 */

export {};
