/** @typedef {import('./types.js').Faction} Faction */
/** @typedef {import('./types.js').GameConfig} GameConfig */
/** @typedef {import('./types.js').LevelDefinition} LevelDefinition */
/** @typedef {import('./types.js').LinkState} LinkState */
/** @typedef {import('./types.js').NodeState} NodeState */

const FACTION_COLORS = {
  player: '#2563eb',
  ai: '#dc2626',
  neutral: '#9ca3af',
};

const FRIENDLY_OUTLINE = '#0f172a';

const LINK_DASH_PATTERN = [12, 8];
const LINK_DASH_CYCLE = LINK_DASH_PATTERN[0] + LINK_DASH_PATTERN[1];
const LINK_DASH_SPEED = 60;

function distance(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

    this.pointer = { x: 0, y: 0, hoverNode: null, dragSource: null, isDragging: false };
    this.accumulator = 0;
    this.lastTimestamp = 0;
    this.animationFrame = 0;
    this.paused = false;
    /** @type {Faction | null} */
    this.winner = null;
    /** @type {LinkState | null} */
    this.lastCreatedLink = null;
    this.tutorialShown = false;
    this.aiCooldown = 0;

    this.loop = (timestamp) => {
      const delta = (timestamp - this.lastTimestamp) / 1000;
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

    this.canvas.width = level.width;
    this.canvas.height = level.height;

    this.hudElements.title.textContent = 'Flowgrid — Level 1';
    this.hudElements.legend.innerHTML =
      '<span class="player">Player</span><span class="ai">AI</span><span class="neutral">Neutral</span>';

    this.resetState();
    this.registerInput();
    this.start();
  }

  start() {
    this.lastTimestamp = performance.now();
    this.animationFrame = requestAnimationFrame(this.loop);
  }

  resetState() {
    this.nodes.clear();
    this.links.clear();
    this.outgoingByNode.clear();
    this.incomingByNode.clear();
    this.lastCreatedLink = null;
    this.pointer = { x: 0, y: 0, hoverNode: null, dragSource: null, isDragging: false };
    this.accumulator = 0;
    this.lastTimestamp = performance.now();
    this.paused = false;
    this.winner = null;
    this.aiCooldown = 0;

    for (const definition of this.initialLevel.nodes) {
      /** @type {NodeState} */
      const node = {
        ...definition,
        energy: definition.energy,
        outgoingLimit: this.config.outgoingLimit,
        safetyReserve: this.config.safetyReserve,
      };
      this.nodes.set(node.id, node);
    }

    for (const node of this.nodes.values()) {
      this.outgoingByNode.set(node.id, []);
      this.incomingByNode.set(node.id, []);
    }

    this.hudElements.prompt.textContent =
      'Drag from a blue node to capture neutrals. Right-click links to remove.';
    this.hudElements.pauseIndicator.style.display = 'none';
    this.hudElements.endScreen.style.display = 'none';
    this.tutorialShown = false;
  }

  registerInput() {
    this.canvas.addEventListener('pointermove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
      this.pointer.y = ((event.clientY - rect.top) / rect.height) * this.canvas.height;
      this.pointer.hoverNode = this.hitTestNode(this.pointer.x, this.pointer.y);
    });

    this.canvas.addEventListener('pointerdown', (event) => {
      if (event.button === 2) {
        this.deleteLinkAtPointer();
        return;
      }
      if (event.button !== 0) {
        return;
      }

      const node = this.pointer.hoverNode;
      if (node && node.owner === 'player') {
        this.pointer.dragSource = node;
        this.pointer.isDragging = true;
        if (!this.tutorialShown) {
          this.hudElements.prompt.textContent = 'Shorter routes are more efficient.';
          this.tutorialShown = true;
        }
      }
    });

    this.canvas.addEventListener('pointerup', (event) => {
      if (event.button !== 0) {
        return;
      }

      if (this.pointer.isDragging && this.pointer.dragSource) {
        const target = this.hitTestNode(this.pointer.x, this.pointer.y);
        if (target && target.id !== this.pointer.dragSource.id) {
          this.createLink(this.pointer.dragSource.id, target.id);
        }
      }
      this.pointer.dragSource = null;
      this.pointer.isDragging = false;
    });

    this.canvas.addEventListener('pointerleave', () => {
      this.pointer.hoverNode = null;
      this.pointer.dragSource = null;
      this.pointer.isDragging = false;
    });

    this.canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        this.togglePause();
        return;
      }
      if (event.key === 'r' || event.key === 'R') {
        this.restart();
        return;
      }

      if (this.lastCreatedLink) {
        const preset = this.config.sharePresets[event.key];
        if (typeof preset === 'number') {
          this.applySharePreset(this.lastCreatedLink, preset);
        }
      }
    });

    this.hudElements.restartButton.addEventListener('click', () => this.restart());
  }

  togglePause() {
    this.paused = !this.paused;
    this.hudElements.pauseIndicator.style.display = this.paused ? 'block' : 'none';
    this.hudElements.pauseIndicator.textContent = 'Paused';
  }

  restart() {
    this.resetState();
  }

  hitTestNode(x, y) {
    for (const node of Array.from(this.nodes.values()).reverse()) {
      const dist = distance(x, y, node.x, node.y);
      if (dist <= node.radius + 6) {
        return node;
      }
    }
    return null;
  }

  deleteLinkAtPointer() {
    /** @type {{ link: LinkState; dist: number } | null} */
    let closest = null;
    for (const link of this.links.values()) {
      if (link.owner !== 'player') continue;
      const source = this.nodes.get(link.sourceId);
      const target = this.nodes.get(link.targetId);
      if (!source || !target) continue;
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dist = distance(this.pointer.x, this.pointer.y, midX, midY);
      if (dist < 18 && (!closest || dist < closest.dist)) {
        closest = { link, dist };
      }
    }
    if (closest) {
      this.removeLink(closest.link.id);
    }
  }

  createLink(sourceId, targetId) {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);
    if (!source || !target) return;

    if (this.winner) return;

    if (source.owner !== 'player' && source.owner !== 'ai') return;
    if (source.owner === 'player' && this.winner) return;

    if (source.owner === 'player' && this.paused) return;

    if (sourceId === targetId) return;
    if (this.links.has(`${sourceId}->${targetId}`)) return;

    if (distance(source.x, source.y, target.x, target.y) > this.config.maxLinkDistance) {
      return;
    }

    const outgoing = this.outgoingByNode.get(sourceId);
    if (!outgoing) return;
    if (outgoing.length >= source.outgoingLimit) {
      return;
    }

    const length = distance(source.x, source.y, target.x, target.y);
    const efficiency = clamp(1 - length * this.config.distanceLoss, this.config.efficiencyFloor, 1);

    /** @type {LinkState} */
    const link = {
      id: `${sourceId}->${targetId}`,
      sourceId,
      targetId,
      share: 1,
      length,
      efficiency,
      owner: source.owner,
      maxRate: this.config.linkMaxRate,
      smoothedRate: 0,
      dashOffset: 0,
    };

    this.links.set(link.id, link);
    outgoing.push(link);
    this.incomingByNode.get(targetId)?.push(link);

    const updatedOutgoing = this.outgoingByNode.get(sourceId) ?? [];
    const equalShare = 1 / updatedOutgoing.length;
    for (const existing of updatedOutgoing) {
      existing.share = equalShare;
    }
    link.share = equalShare;
    this.lastCreatedLink = link;
  }

  applySharePreset(link, fraction) {
    const sourceLinks = this.outgoingByNode.get(link.sourceId);
    if (!sourceLinks) return;
    if (!sourceLinks.includes(link)) return;

    const totalWithout = sourceLinks.reduce((acc, l) => (l === link ? acc : acc + l.share), 0);
    const remaining = Math.max(0, 1 - totalWithout);
    const desired = clamp(fraction, 0.05, 1);
    link.share = Math.min(desired, remaining);

    const total = sourceLinks.reduce((acc, l) => acc + l.share, 0);
    if (total > 1) {
      const scale = 1 / total;
      for (const outgoing of sourceLinks) {
        outgoing.share *= scale;
      }
    }
  }

  removeLink(id) {
    const link = this.links.get(id);
    if (!link) return;
    const outgoing = this.outgoingByNode.get(link.sourceId);
    if (outgoing) {
      const index = outgoing.indexOf(link);
      if (index >= 0) {
        outgoing.splice(index, 1);
      }
      const count = outgoing.length;
      if (count > 0) {
        const equalShare = 1 / count;
        for (const existing of outgoing) {
          existing.share = equalShare;
        }
      }
    }
    const incoming = this.incomingByNode.get(link.targetId);
    if (incoming) {
      const index = incoming.indexOf(link);
      if (index >= 0) {
        incoming.splice(index, 1);
      }
    }
    link.dashOffset = 0;
    link.smoothedRate = 0;
    this.links.delete(id);
    if (this.lastCreatedLink?.id === id) {
      this.lastCreatedLink = null;
    }
  }

  update(dt) {
    // Regenerate energy
    for (const node of this.nodes.values()) {
      node.energy = Math.min(node.capacity, node.energy + node.regen * dt);
    }

    /** @type {Record<string, Faction | null>} */
    const aggressor = {};

    for (const [nodeId, outgoing] of this.outgoingByNode) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;
      if (outgoing.length === 0) continue;
      if (node.energy <= node.safetyReserve) {
        for (const link of outgoing) {
          link.smoothedRate *= 0.8;
        }
        continue;
      }

      const available = Math.max(0, node.energy - node.safetyReserve);
      if (available <= 0) continue;

      const shareSum = outgoing.reduce((acc, link) => acc + link.share, 0);
      if (shareSum <= 0) {
        for (const link of outgoing) {
          link.smoothedRate *= 0.8;
        }
        continue;
      }

      for (const link of outgoing) {
        const shareFraction = link.share / shareSum;
        const intendedRate = available * shareFraction;
        const rate = Math.min(link.maxRate, intendedRate);
        const transfer = rate * dt;
        if (transfer <= 0) {
          link.smoothedRate = link.smoothedRate * 0.8;
          continue;
        }

        node.energy = Math.max(0, node.energy - transfer);

        const delivered = transfer * link.efficiency;
        const target = this.nodes.get(link.targetId);
        if (!target) continue;

        if (target.owner === link.owner) {
          target.energy = Math.min(target.capacity, target.energy + delivered);
        } else {
          target.energy = Math.max(0, target.energy - delivered);
          aggressor[target.id] = link.owner;
        }

        link.smoothedRate = link.smoothedRate * 0.8 + rate * 0.2;
      }
    }

    for (const link of this.links.values()) {
      const normalized = link.maxRate > 0 ? clamp(link.smoothedRate / link.maxRate, 0, 1) : 0;
      if (normalized <= 0.01) {
        link.smoothedRate = 0;
        link.dashOffset = 0;
        continue;
      }

      const delta = normalized * LINK_DASH_SPEED * dt;
      link.dashOffset -= delta;
      if (link.dashOffset <= -LINK_DASH_CYCLE) {
        link.dashOffset += LINK_DASH_CYCLE;
      }
    }

    for (const node of this.nodes.values()) {
      if (node.energy <= 0) {
        const faction = aggressor[node.id];
        if (faction) {
          this.captureNode(node, faction);
        }
      }
    }

    this.aiCooldown -= dt;
    if (this.aiCooldown <= 0 && !this.winner) {
      this.runAiTurn();
      this.aiCooldown = 0.35;
    }

    this.checkVictory();
  }

  captureNode(node, newOwner) {
    node.owner = newOwner;
    node.energy = this.config.captureSeed;

    const outgoing = this.outgoingByNode.get(node.id) ?? [];
    for (const link of [...outgoing]) {
      this.removeLink(link.id);
    }
  }

  runAiTurn() {
    const aiNodes = Array.from(this.nodes.values()).filter((node) => node.owner === 'ai');
    for (const source of aiNodes) {
      const surplus = source.energy - source.safetyReserve;
      if (surplus < this.config.surplusThreshold) {
        this.trimAiLinksIfWeak(source);
        continue;
      }

      const outgoing = this.outgoingByNode.get(source.id) ?? [];
      if (outgoing.length >= source.outgoingLimit) {
        continue;
      }

      const candidates = Array.from(this.nodes.values())
        .filter((node) => node.id !== source.id && distance(node.x, node.y, source.x, source.y) <= this.config.maxLinkDistance)
        .sort((a, b) => distance(source.x, source.y, a.x, a.y) - distance(source.x, source.y, b.x, b.y));

      /** @type {NodeState | null} */
      let chosen = null;

      const neutralPriority = candidates.filter((node) => node.owner === 'neutral' && node.energy < surplus);
      if (neutralPriority.length > 0) {
        chosen = neutralPriority[0];
      }

      if (!chosen) {
        const enemyTargets = candidates
          .filter((node) => node.owner === 'player')
          .sort((a, b) => a.energy - b.energy);
        if (enemyTargets.length > 0) {
          chosen = enemyTargets[0];
        }
      }

      if (chosen) {
        this.createLink(source.id, chosen.id);
      }
    }
  }

  trimAiLinksIfWeak(node) {
    const outgoing = this.outgoingByNode.get(node.id);
    if (!outgoing || outgoing.length === 0) return;
    if (node.energy > node.safetyReserve + 5) return;

    /** @type {LinkState | null} */
    let longest = null;
    for (const link of outgoing) {
      if (!longest || link.length > longest.length) {
        longest = link;
      }
    }
    if (longest) {
      this.removeLink(longest.id);
    }
  }

  checkVictory() {
    const playerOwnsAll = Array.from(this.nodes.values()).every((node) => node.owner === 'player');
    if (playerOwnsAll) {
      this.setWinner('player');
      return;
    }

    const aiOwnsAll = Array.from(this.nodes.values()).every((node) => node.owner === 'ai');
    if (aiOwnsAll) {
      this.setWinner('ai');
    }
  }

  setWinner(faction) {
    this.winner = faction;
    this.paused = true;
    this.hudElements.endScreen.style.display = 'flex';
    this.hudElements.endHeadline.textContent = faction === 'player' ? 'Network Secured' : 'Network Compromised';
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = '#f6f3ef';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setLineDash(LINK_DASH_PATTERN);
    for (const link of this.links.values()) {
      const source = this.nodes.get(link.sourceId);
      const target = this.nodes.get(link.targetId);
      if (!source || !target) continue;
      const color = FACTION_COLORS[link.owner];
      ctx.strokeStyle = color;
      const thickness = 2 + clamp(link.smoothedRate / link.maxRate, 0, 1) * 6;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.lineDashOffset = link.dashOffset;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    if (this.pointer.isDragging && this.pointer.dragSource) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = 0;
      ctx.beginPath();
      ctx.moveTo(this.pointer.dragSource.x, this.pointer.dragSource.y);
      ctx.lineTo(this.pointer.x, this.pointer.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }

    for (const node of this.nodes.values()) {
      const color = FACTION_COLORS[node.owner];
      ctx.fillStyle = '#f1ece6';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = node.owner === 'player' ? FRIENDLY_OUTLINE : '#1f2933';
      ctx.lineWidth = this.pointer.hoverNode?.id === node.id ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 1, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();

      const energyRatio = clamp(node.energy / node.capacity, 0, 1);
      const innerRadius = node.radius - 4;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, innerRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(node.x, node.y, innerRadius * energyRatio, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#1f2933';
      ctx.font = '12px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(node.energy).toString(), node.x, node.y);
    }
  }
}
