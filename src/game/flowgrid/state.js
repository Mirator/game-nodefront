/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */
/** @typedef {import('../../types.js').LevelDefinition} LevelDefinition */
/** @typedef {import('../../types.js').NodeState} NodeState */

import { createPointerState } from '../pointer.js';
import { createSeededRng, normalizeSeed } from '../math.js';
import { DEFAULT_NODE_TYPE, NODE_TYPES } from '../nodeTypes.js';
import { isAiFaction } from '../constants.js';
import { prepareAiControllersForLevel } from './ai.js';

/**
 * @param {FlowgridGame} game
 * @param {LevelDefinition} level
 */
function updateCanvasDisplaySize(game, level) {
  const { canvas } = game;
  if (!canvas || !level) {
    return;
  }

  const container = canvas.parentElement;
  if (!(container instanceof HTMLElement)) {
    canvas.style.width = `${level.width}px`;
    canvas.style.height = `${level.height}px`;
    return;
  }

  const { clientWidth, clientHeight } = container;
  if (clientWidth <= 0 || clientHeight <= 0) {
    canvas.style.width = `${level.width}px`;
    canvas.style.height = `${level.height}px`;
    return;
  }

  const scale = Math.min(clientWidth / level.width, clientHeight / level.height, 1);
  const displayWidth = level.width * scale;
  const displayHeight = level.height * scale;

  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
}

/**
 * @param {LevelDefinition} level
 * @param {import('../../types.js').NodeDefinition} definition
 * @param {{capacity: number}} typeConfig
 * @param {import('../../types.js').NodeTypeId} type
 */
function resolveInitialEnergy(level, definition, typeConfig, type) {
  const energyConfig = level.initialEnergy;
  const candidates = [
    energyConfig?.overrides?.[definition.id],
    definition.energy,
    energyConfig?.[definition.owner]?.[type],
    energyConfig?.[definition.owner]?.default,
    energyConfig?.defaults?.[type],
    energyConfig?.default,
    typeConfig.capacity,
  ];

  for (const value of candidates) {
    if (Number.isFinite(value)) {
      return Math.min(value, typeConfig.capacity);
    }
  }

  return typeConfig.capacity;
}

/**
 * @param {FlowgridGame} game
 * @param {LevelDefinition} level
 */
export function applyLevel(game, level) {
  game.initialLevel = level;
  game.canvas.width = level.width;
  game.canvas.height = level.height;

  if (typeof window !== 'undefined') {
    if (game._handleResize) {
      window.removeEventListener('resize', game._handleResize);
    }

    const handleResize = () => updateCanvasDisplaySize(game, level);
    game._handleResize = handleResize;
    window.addEventListener('resize', handleResize);
  }

  updateCanvasDisplaySize(game, level);

  if (level.name) {
    game.hudElements.title.textContent = `Flowgrid — ${level.name}`;
  } else {
    game.hudElements.title.textContent = 'Flowgrid';
  }
}

/**
 * @param {FlowgridGame} game
 * @param {LevelDefinition} level
 */
export function loadLevel(game, level) {
  applyLevel(game, level);
  resetState(game);
}

/**
 * @param {FlowgridGame} game
 */
function deriveGameSeed(game) {
  if (game.initialLevel && Number.isFinite(game.initialLevel.seed)) {
    return normalizeSeed(game.initialLevel.seed);
  }
  if (Number.isFinite(game.config.captureSeed)) {
    return normalizeSeed(game.config.captureSeed);
  }
  if (Number.isFinite(game.randomSeed)) {
    return normalizeSeed(game.randomSeed);
  }
  return 0;
}

/**
 * @param {FlowgridGame} game
 */
export function resetState(game) {
  const seed = deriveGameSeed(game);
  game.randomSeed = seed;
  game.randomGenerator = createSeededRng(seed);

  game.nodes.clear();
  game.links.clear();
  game.outgoingByNode.clear();
  game.incomingByNode.clear();
  game.pointer = createPointerState();
  game.accumulator = 0;
  game.lastTimestamp = performance.now();
  game.paused = false;
  game.winner = null;
  game.aiNodeAttackCooldown.clear();
  game.elapsedTime = 0;

  prepareAiControllersForLevel(game);

  for (const definition of game.initialLevel.nodes) {
    const type = definition.type ?? DEFAULT_NODE_TYPE;
    const typeConfig = NODE_TYPES[type];
    if (!typeConfig) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const energy = resolveInitialEnergy(game.initialLevel, definition, typeConfig, type);

    /** @type {NodeState} */
    const node = {
      ...definition,
      type,
      capacity: typeConfig.capacity,
      regen: typeConfig.regen,
      radius: typeConfig.radius,
      energy,
      outgoingLimit: typeConfig.outgoingLimit,
      safetyReserve: game.config.safetyReserve,
      flashTimer: 0,
      flashDuration: 0,
    };
    game.nodes.set(node.id, node);
    if (isAiFaction(node.owner)) {
      const controller = game.aiControllers?.get(node.owner);
      if (controller && controller.nodeAttackDelay > 0) {
        game.aiNodeAttackCooldown.set(node.id, controller.nodeAttackDelay);
      }
    }
  }

  for (const node of game.nodes.values()) {
    game.outgoingByNode.set(node.id, []);
    game.incomingByNode.set(node.id, []);
  }

  game.setPrompt('Drag from a blue node to capture neutrals. Right-click links to remove.');
  game.hudElements.pauseIndicator.style.display = 'none';
  game.hudElements.endScreen.style.display = 'none';
  game.tutorialShown = false;
}
