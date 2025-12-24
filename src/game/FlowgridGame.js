/** @typedef {import('../types.js').Faction} Faction */
/** @typedef {import('../types.js').GameConfig} GameConfig */
/** @typedef {import('../types.js').LevelDefinition} LevelDefinition */
import {
  initializeAiState,
  runAiTurn as runAiTurnImpl,
  trimAiLinksIfWeak as trimAiLinksIfWeakImpl,
  getAvailableStrategies as getAvailableStrategiesImpl,
  getAiStrategyId as getAiStrategyIdImpl,
  getAiStrategyLabel as getAiStrategyLabelImpl,
  setAiStrategy as setAiStrategyImpl,
  queueAiLink as queueAiLinkImpl,
} from './flowgrid/ai.js';
import { registerInputHandlers } from './flowgrid/input.js';
import { applyLevel as applyLevelImpl, loadLevel as loadLevelImpl, resetState as resetStateImpl } from './flowgrid/state.js';
import { clearPromptTimeout as clearPromptTimeoutImpl, setPrompt as setPromptImpl, applyPrompt as applyPromptImpl, showTemporaryPrompt as showTemporaryPromptImpl } from './flowgrid/prompt.js';
import { start as startImpl, isRunning as isRunningImpl, isPaused as isPausedImpl, pause as pauseImpl, resume as resumeImpl, togglePause as togglePauseImpl, restart as restartImpl } from './flowgrid/lifecycle.js';
import { hitTestNode as hitTestNodeImpl, deleteLinkAtPointer as deleteLinkAtPointerImpl, createLink as createLinkImpl, removeLink as removeLinkImpl } from './flowgrid/links.js';
import { update as updateImpl } from './flowgrid/update.js';
import { captureNode as captureNodeImpl, checkVictory as checkVictoryImpl, setWinner as setWinnerImpl } from './flowgrid/victory.js';
import { render as renderImpl } from './flowgrid/render.js';
import { createPointerState } from './pointer.js';
import { createSeededRng } from './math.js';
import { FACTION_LABELS } from './constants.js';

const DEFAULT_MAX_FRAME_DELTA = 0.25;

const ENERGY_CHART_COLORS = {
  player: '#2563eb',
  'ai-red': '#dc2626',
  'ai-purple': '#7c3aed',
  neutral: '#4b5563',
};

export class FlowgridGame {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{
   *   title: HTMLElement;
   *   legend: HTMLElement;
   *   prompt: HTMLElement;
   *   pauseIndicator: HTMLElement;
   *   endScreen: HTMLDivElement;
   *   endHeadline: HTMLHeadingElement;
   *   restartButton: HTMLButtonElement;
   *   energyValues: {
   *     player: HTMLElement;
   *     'ai-red': HTMLElement;
   *     'ai-purple': HTMLElement;
   *     neutral: HTMLElement;
   *   };
   *   energyChart: HTMLDivElement;
   *   energyTotal: HTMLDivElement;
   * }} hudElements
   * @param {LevelDefinition} level
   * @param {GameConfig} config
   */
  constructor(canvas, hudElements, level, config) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available.');
    }

    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = context;
    this.hudElements = hudElements;
    this.initialLevel = level;
    this.config = config;

    this.nodes = new Map();
    this.links = new Map();
    this.outgoingByNode = new Map();
    this.incomingByNode = new Map();

    this.pointer = createPointerState();
    this.accumulator = 0;
    this.lastTimestamp = 0;
    this.animationFrame = 0;
    this.paused = false;
    this.running = false;
    /** @type {Faction | null} */
    this.winner = null;
    this.tutorialShown = false;
    this.promptLastMessage = '';
    this.promptLastVariant = 'normal';
    this.promptTimeout = 0;

    /** @type {((faction: Faction) => void) | null} */
    this.winnerListener = null;

    /** @type {(() => void) | null} */
    this._handleResize = null;

    /** @type {number} */
    this.randomSeed = 0;
    /** @type {{ next: () => number }} */
    this.randomGenerator = createSeededRng(this.randomSeed);
    /** @type {() => number} */
    this.random = () => this.randomGenerator.next();

    this.maxFrameDelta =
      typeof config.maxFrameDelta === 'number' ? config.maxFrameDelta : DEFAULT_MAX_FRAME_DELTA;

    /** @type {number} */
    this.elapsedTime = 0;

    initializeAiState(this);

    /**
     * Cache the last rendered energy summary so we can avoid touching the DOM
     * if nothing has changed or if we're updating too frequently.
     */
    this.energySummaryCache = {
      totals: { player: 0, 'ai-red': 0, 'ai-purple': 0, neutral: 0 },
      totalEnergy: 0,
      visibleKey: '',
      chartBackground: '',
    };
    this.energySummaryThrottleMs = 100;
    this.lastEnergySummaryUpdate = 0;

    this.loop = (timestamp) => {
      const rawDelta = (timestamp - this.lastTimestamp) / 1000;
      const delta = Math.min(Math.max(rawDelta, 0), this.maxFrameDelta);
      this.lastTimestamp = timestamp;

      if (!this.paused && !this.winner) {
        this.accumulator += delta;
        const step = this.config.fixedStep;
        while (this.accumulator >= step) {
          this.update(step);
          this.accumulator -= step;
        }
      }

      this.render();
      this.animationFrame = requestAnimationFrame(this.loop);
    };

    this.applyLevel(level);
    this.resetState();
    this.registerInput();
  }

  start() {
    startImpl(this);
  }

  isRunning() {
    return isRunningImpl(this);
  }

  isPaused() {
    return isPausedImpl(this);
  }

  applyLevel(level) {
    applyLevelImpl(this, level);
    this.setAiStrategy(level?.aiStrategyId, { silent: true });
  }

  loadLevel(level) {
    loadLevelImpl(this, level);
    this.updateEnergySummary(true);
  }

  resetState() {
    resetStateImpl(this);
    this.accumulator = 0;
    this.lastTimestamp = 0;
    this.updateEnergySummary(true);
  }

  clearPromptTimeout() {
    clearPromptTimeoutImpl(this);
  }

  setPrompt(message, variant = 'normal') {
    setPromptImpl(this, message, variant);
  }

  applyPrompt(message, variant) {
    applyPromptImpl(this, message, variant);
  }

  showTemporaryPrompt(message, variant = 'normal', duration = 2000) {
    showTemporaryPromptImpl(this, message, variant, duration);
  }

  registerInput() {
    registerInputHandlers(this);
  }

  pause(showIndicator = true) {
    pauseImpl(this, showIndicator);
  }

  resume() {
    resumeImpl(this);
  }

  togglePause() {
    togglePauseImpl(this);
  }

  restart() {
    restartImpl(this);
  }

  hitTestNode(x, y) {
    return hitTestNodeImpl(this, x, y);
  }

  deleteLinkAtPointer() {
    deleteLinkAtPointerImpl(this);
  }

  createLink(sourceId, targetId) {
    createLinkImpl(this, sourceId, targetId);
  }

  queueAiLink(faction, sourceId, targetId, options) {
    return queueAiLinkImpl(this, faction, sourceId, targetId, options);
  }

  removeLink(id) {
    removeLinkImpl(this, id);
  }

  update(dt) {
    updateImpl(this, dt);
  }

  captureNode(node, newOwner) {
    captureNodeImpl(this, node, newOwner);
  }

  runAiTurn(faction) {
    runAiTurnImpl(this, faction);
  }

  trimAiLinksIfWeak(node) {
    trimAiLinksIfWeakImpl(this, node);
  }

  checkVictory() {
    checkVictoryImpl(this);
  }

  setWinner(faction) {
    setWinnerImpl(this, faction);
    if (this.winnerListener) {
      this.winnerListener(faction);
    }
  }

  /**
   * @param {((faction: Faction) => void) | null} listener
   */
  setOnWinnerChange(listener) {
    this.winnerListener = typeof listener === 'function' ? listener : null;
  }

  render() {
    renderImpl(this);
    this.updateEnergySummary();
  }

  updateEnergySummary(force = false) {
    const { energyValues, energyChart, energyTotal, legend } = this.hudElements;
    if (!energyValues) {
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!force && now - this.lastEnergySummaryUpdate < this.energySummaryThrottleMs) {
      return;
    }

    /** @type {Record<Faction, number>} */
    const totals = { player: 0, 'ai-red': 0, 'ai-purple': 0, neutral: 0 };
    /** @type {Record<Faction, boolean>} */
    const hasNodes = { player: false, 'ai-red': false, 'ai-purple': false, neutral: false };
    for (const node of this.nodes.values()) {
      if (totals[node.owner] !== undefined) {
        totals[node.owner] += node.energy;
        hasNodes[node.owner] = true;
      }
    }

    /** @type {Array<Faction>} */
    const factions = ['player', 'ai-red', 'ai-purple', 'neutral'];
    /** @type {Array<Faction>} */
    const visibleFactions = [];
    for (const faction of factions) {
      const shouldShow = faction === 'player' || hasNodes[faction];
      if (shouldShow) {
        visibleFactions.push(faction);
      }
    }

    const totalEnergy = factions.reduce((sum, faction) => sum + (totals[faction] ?? 0), 0);
    const visibleKey = visibleFactions.join('|');
    let chartBackground = 'conic-gradient(#e2e8f0 0deg 360deg)';

    if (totalEnergy > 0) {
      let startAngle = 0;
      const segments = [];
      for (const faction of factions) {
        const value = totals[faction] ?? 0;
        if (value <= 0) {
          continue;
        }

        const angle = (value / totalEnergy) * 360;
        const endAngle = startAngle + angle;
        const color = ENERGY_CHART_COLORS[faction] ?? '#e2e8f0';
        segments.push(`${color} ${startAngle}deg ${endAngle}deg`);
        startAngle = endAngle;
      }
      chartBackground = `conic-gradient(${segments.join(', ')})`;
    }

    const cache = this.energySummaryCache;
    this.lastEnergySummaryUpdate = now;
    const totalsChanged = factions.some((faction) => cache.totals[faction] !== totals[faction]);
    const visibilityChanged = cache.visibleKey !== visibleKey;
    const totalEnergyChanged = cache.totalEnergy !== totalEnergy;
    const chartChanged = cache.chartBackground !== chartBackground;

    if (!force && !totalsChanged && !visibilityChanged && !totalEnergyChanged && !chartChanged) {
      return;
    }

    for (const faction of factions) {
      const shouldShow = faction === 'player' || hasNodes[faction];
      const valueElement = energyValues[faction];
      if (valueElement) {
        if (cache.totals[faction] !== totals[faction]) {
          valueElement.textContent = String(Math.round(totals[faction] ?? 0));
        }
        const entryElement = valueElement.parentElement;
        if (entryElement && entryElement.hidden === shouldShow) {
          entryElement.hidden = !shouldShow;
        }
      }
    }

    if (energyTotal && (force || totalEnergyChanged)) {
      energyTotal.textContent = String(Math.round(totalEnergy));
    }

    if (energyChart && (force || chartChanged)) {
      energyChart.style.background = chartBackground;
    }

    if (legend && (force || visibilityChanged)) {
      legend.innerHTML = visibleFactions
        .map((faction) => {
          const label = FACTION_LABELS[faction] ?? faction;
          return `<span class="${faction}">${label}</span>`;
        })
        .join('');
    }

    cache.visibleKey = visibleKey;
    cache.totalEnergy = totalEnergy;
    cache.chartBackground = chartBackground;
    for (const faction of factions) {
      cache.totals[faction] = totals[faction] ?? 0;
    }
  }

  /**
   * @returns {ReadonlyArray<{ id: string; label: string }>}
   */
  getAvailableStrategies() {
    return getAvailableStrategiesImpl(this);
  }

  /**
   * @returns {string}
   */
  getAiStrategyId() {
    return getAiStrategyIdImpl(this);
  }

  /**
   * @returns {string}
   */
  getAiStrategyLabel() {
    return getAiStrategyLabelImpl(this);
  }

  /**
   * @param {string | undefined} id
   * @param {{ silent?: boolean }} [options]
   */
  setAiStrategy(id, options) {
    setAiStrategyImpl(this, id, options);
  }
}
