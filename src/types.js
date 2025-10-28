/**
 * @typedef {'player' | 'ai' | 'neutral'} Faction
 */

/**
 * @typedef {'small' | 'medium' | 'large'} NodeTypeId
 */

/**
 * @typedef {Object} NodeDefinition
 * @property {string} id
 * @property {number} x
 * @property {number} y
 * @property {Faction} owner
 * @property {number} [energy]
 * @property {NodeTypeId} [type]
 * @property {number} [capacity]
 * @property {number} [regen]
 * @property {number} [radius]
 */

/**
 * @typedef {Object} OwnerEnergyConfig
 * @property {number} [default]
 * @property {number} [small]
 * @property {number} [medium]
 * @property {number} [large]
 */

/**
 * @typedef {Object} LevelEnergyConfig
 * @property {number} [default]
 * @property {Partial<Record<NodeTypeId, number>>} [defaults]
 * @property {OwnerEnergyConfig} [player]
 * @property {OwnerEnergyConfig} [ai]
 * @property {OwnerEnergyConfig} [neutral]
 * @property {Record<string, number>} [overrides]
 */

/**
 * @typedef {Object} LevelDefinition
 * @property {string} id
 * @property {string} name
 * @property {number} width
 * @property {number} height
  * @property {Array<NodeDefinition>} nodes
  * @property {number} [seed]
  * @property {string} [aiStrategyId]
 * @property {LevelEnergyConfig} [initialEnergy]
 */

/**
 * @typedef {NodeDefinition & {
 *   outgoingLimit: number;
 *   safetyReserve: number;
 *   energy: number;
 *   owner: Faction;
 *   type: NodeTypeId;
 * }} NodeState
 */

/**
 * @typedef {Object} LinkState
 * @property {string} id
 * @property {string} sourceId
 * @property {string} targetId
 * @property {number} share
 * @property {number} length
 * @property {number} efficiency - Ratio of energy delivered to the target (constant in MVP).
 * @property {Faction} owner
 * @property {number} maxRate
 * @property {number} smoothedRate
 * @property {number} dashOffset
 * @property {number} buildProgress - Distance that has been established along the link.
 * @property {boolean} establishing - Whether the link is still being established.
 */

/**
 * @typedef {Object} GameConfig
 * @property {number} fixedStep
 * @property {number} distanceLoss - Rate reduction per pixel of link length.
 * @property {number} efficiencyFloor - Minimum rate multiplier applied to long links.
 * @property {number} captureSeed
 * @property {number} safetyReserve
 * @property {number} linkMaxRate
 * @property {number} surplusThreshold
 * @property {number} regenRateMultiplier
 * @property {Record<string, number>} sharePresets
 * @property {number} [aiTurnInterval]
 * @property {number} [aiInitialDelay]
 * @property {number} [aiNodeAttackDelay]
 * @property {number} [maxFrameDelta]
 */

export {};
