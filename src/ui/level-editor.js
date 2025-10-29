import { NODE_TYPES, DEFAULT_NODE_TYPE } from '../game/nodeTypes.js';

/** @typedef {import('../types.js').LevelDefinition} LevelDefinition */
/** @typedef {import('../types.js').NodeDefinition} NodeDefinition */

const OWNER_OPTIONS = [
  { id: 'player', label: 'Player' },
  { id: 'ai-red', label: 'Red Enemy' },
  { id: 'ai-purple', label: 'Purple Enemy' },
  { id: 'neutral', label: 'Neutral' },
];

const NODE_TYPE_OPTIONS = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const DEFAULT_LEVEL = {
  id: 'custom-level',
  name: 'Custom Level',
  width: 1500,
  height: 900,
  seed: 1,
  aiStrategyId: 'slow-simple',
  nodes: [],
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const sanitizeNumber = (value, fallback = 0) => {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizePositiveInteger = (value, fallback) => {
  const parsed = Math.round(Math.max(0, sanitizeNumber(value, fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toConstName = (id) => {
  if (!id) {
    return 'customLevel';
  }
  const parts = String(id)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return 'customLevel';
  }
  const [first, ...rest] = parts;
  return [first.toLowerCase(), ...rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())].join('');
};

const copyDefinition = (definition) => {
  const nodes = Array.isArray(definition.nodes)
    ? definition.nodes.map((node) => ({ ...node }))
    : [];
  return {
    id: definition.id ?? DEFAULT_LEVEL.id,
    name: definition.name ?? DEFAULT_LEVEL.name,
    width: sanitizePositiveInteger(definition.width, DEFAULT_LEVEL.width),
    height: sanitizePositiveInteger(definition.height, DEFAULT_LEVEL.height),
    seed: definition.seed ?? DEFAULT_LEVEL.seed,
    aiStrategyId: definition.aiStrategyId ?? DEFAULT_LEVEL.aiStrategyId,
    initialEnergy: definition.initialEnergy,
    nodes,
  };
};

const formatLevel = (definition, exportConstName) => {
  const { initialEnergy, ...rest } = definition;
  /** @type {LevelDefinition} */
  const normalized = {
    ...rest,
    nodes: definition.nodes.map((node) => {
      const nodeExport = {
        id: node.id,
        x: Math.round(node.x),
        y: Math.round(node.y),
        owner: node.owner,
      };
      if (node.type && node.type !== DEFAULT_NODE_TYPE) {
        nodeExport.type = node.type;
      }
      if (typeof node.energy === 'number') {
        nodeExport.energy = Math.round(node.energy);
      }
      return nodeExport;
    }),
  };
  if (initialEnergy) {
    normalized.initialEnergy = initialEnergy;
  }
  if (normalized.seed === undefined || normalized.seed === null) {
    delete normalized.seed;
  }
  if (!normalized.aiStrategyId) {
    delete normalized.aiStrategyId;
  }
  const code = JSON.stringify(normalized, null, 2);
  return `/** @type {import('../types.js').LevelDefinition} */\nexport const ${exportConstName} = ${code};`;
};

const createField = (labelText, input) => {
  const label = document.createElement('label');
  const text = document.createElement('span');
  text.textContent = labelText;
  label.appendChild(text);
  label.appendChild(input);
  return label;
};

const NODE_COLORS = {
  player: '#2563eb',
  'ai-red': '#dc2626',
  'ai-purple': '#7c3aed',
  neutral: '#6b7280',
};

const NODE_TYPE_RADIUS = Object.fromEntries(
  Object.entries(NODE_TYPES).map(([type, config]) => [type, config.radius ?? 24])
);

/**
 * Creates the level editor overlay.
 * @param {HTMLElement} root
 */
export function createLevelEditor(root) {
  const overlay = document.createElement('div');
  overlay.className = 'editor-overlay';
  root.appendChild(overlay);

  const panel = document.createElement('div');
  panel.className = 'editor';
  overlay.appendChild(panel);

  const header = document.createElement('div');
  header.className = 'editor__header';
  panel.appendChild(header);

  const title = document.createElement('h2');
  title.textContent = 'Level Editor';
  header.appendChild(title);

  const headerActions = document.createElement('div');
  headerActions.className = 'editor__header-actions';
  header.appendChild(headerActions);

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'editor__primary-action';
  exportButton.textContent = 'Export Level';
  headerActions.appendChild(exportButton);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'editor__close';
  closeButton.textContent = 'Back to Menu';
  headerActions.appendChild(closeButton);

  const body = document.createElement('div');
  body.className = 'editor__body';
  panel.appendChild(body);

  const inspector = document.createElement('div');
  inspector.className = 'editor__inspector';
  body.appendChild(inspector);

  const levelSection = document.createElement('section');
  levelSection.className = 'editor__section';
  inspector.appendChild(levelSection);

  const levelHeading = document.createElement('h3');
  levelHeading.textContent = 'Level Details';
  levelSection.appendChild(levelHeading);

  const levelGrid = document.createElement('div');
  levelGrid.className = 'editor__grid';
  levelSection.appendChild(levelGrid);

  const levelIdInput = document.createElement('input');
  levelIdInput.type = 'text';
  levelGrid.appendChild(createField('Level ID', levelIdInput));

  const levelNameInput = document.createElement('input');
  levelNameInput.type = 'text';
  levelGrid.appendChild(createField('Display Name', levelNameInput));

  const widthInput = document.createElement('input');
  widthInput.type = 'number';
  widthInput.min = '100';
  widthInput.step = '10';
  levelGrid.appendChild(createField('Width', widthInput));

  const heightInput = document.createElement('input');
  heightInput.type = 'number';
  heightInput.min = '100';
  heightInput.step = '10';
  levelGrid.appendChild(createField('Height', heightInput));

  const seedInput = document.createElement('input');
  seedInput.type = 'number';
  seedInput.step = '1';
  seedInput.min = '0';
  levelGrid.appendChild(createField('Seed', seedInput));

  const aiStrategyInput = document.createElement('input');
  aiStrategyInput.type = 'text';
  levelGrid.appendChild(createField('AI Strategy', aiStrategyInput));

  const nodeActions = document.createElement('div');
  nodeActions.className = 'editor__node-actions';
  levelSection.appendChild(nodeActions);

  const addNodeButton = document.createElement('button');
  addNodeButton.type = 'button';
  addNodeButton.className = 'editor__secondary-action';
  addNodeButton.textContent = 'Add Node';
  nodeActions.appendChild(addNodeButton);

  const removeNodeButton = document.createElement('button');
  removeNodeButton.type = 'button';
  removeNodeButton.className = 'editor__secondary-action';
  removeNodeButton.textContent = 'Delete Node';
  removeNodeButton.disabled = true;
  nodeActions.appendChild(removeNodeButton);

  const nodeSection = document.createElement('section');
  nodeSection.className = 'editor__section';
  inspector.appendChild(nodeSection);

  const nodeHeading = document.createElement('h3');
  nodeHeading.textContent = 'Node Properties';
  nodeSection.appendChild(nodeHeading);

  const nodeGrid = document.createElement('div');
  nodeGrid.className = 'editor__grid';
  nodeSection.appendChild(nodeGrid);

  const nodeIdInput = document.createElement('input');
  nodeIdInput.type = 'text';
  nodeGrid.appendChild(createField('Node ID', nodeIdInput));

  const nodeOwnerSelect = document.createElement('select');
  OWNER_OPTIONS.forEach(({ id, label }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = label;
    nodeOwnerSelect.appendChild(option);
  });
  nodeGrid.appendChild(createField('Owner', nodeOwnerSelect));

  const nodeTypeSelect = document.createElement('select');
  NODE_TYPE_OPTIONS.forEach(({ id, label }) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = label;
    nodeTypeSelect.appendChild(option);
  });
  nodeGrid.appendChild(createField('Type', nodeTypeSelect));

  const nodeEnergyInput = document.createElement('input');
  nodeEnergyInput.type = 'number';
  nodeEnergyInput.step = '1';
  nodeEnergyInput.min = '0';
  nodeGrid.appendChild(createField('Initial Energy', nodeEnergyInput));

  const nodeXInput = document.createElement('input');
  nodeXInput.type = 'number';
  nodeXInput.step = '1';
  nodeGrid.appendChild(createField('X Position', nodeXInput));

  const nodeYInput = document.createElement('input');
  nodeYInput.type = 'number';
  nodeYInput.step = '1';
  nodeGrid.appendChild(createField('Y Position', nodeYInput));

  const exportSection = document.createElement('section');
  exportSection.className = 'editor__section';
  inspector.appendChild(exportSection);

  const exportHeading = document.createElement('h3');
  exportHeading.textContent = 'Export';
  exportSection.appendChild(exportHeading);

  const exportGrid = document.createElement('div');
  exportGrid.className = 'editor__grid';
  exportSection.appendChild(exportGrid);

  const exportConstInput = document.createElement('input');
  exportConstInput.type = 'text';
  exportGrid.appendChild(createField('Export Constant', exportConstInput));

  const exportOutput = document.createElement('textarea');
  exportOutput.className = 'editor__export';
  exportOutput.readOnly = true;
  exportOutput.rows = 12;
  exportSection.appendChild(exportOutput);

  const canvasContainer = document.createElement('div');
  canvasContainer.className = 'editor__canvas-container';
  body.appendChild(canvasContainer);

  const canvas = document.createElement('div');
  canvas.className = 'editor__canvas';
  canvasContainer.appendChild(canvas);

  /** @type {LevelDefinition} */
  let currentLevel = copyDefinition(DEFAULT_LEVEL);
  /** @type {Array<NodeDefinition & { owner: string; type: string }>} */
  let nodes = [];
  /** @type {string | null} */
  let selectedNodeId = null;
  /** @type {() => void} */
  let onClose = () => {};

  const buildLevelDefinition = () => {
    const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
    const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
    const seed = seedInput.value === '' ? undefined : sanitizePositiveInteger(seedInput.value, currentLevel.seed ?? 1);
    const aiStrategyId = aiStrategyInput.value.trim();

    return {
      id: levelIdInput.value.trim() || DEFAULT_LEVEL.id,
      name: levelNameInput.value.trim() || DEFAULT_LEVEL.name,
      width,
      height,
      seed,
      aiStrategyId: aiStrategyId || undefined,
      nodes: nodes.map((node) => {
        const energyValue = node.energy;
        return {
          id: node.id,
          x: clamp(Math.round(node.x), 0, width),
          y: clamp(Math.round(node.y), 0, height),
          owner: /** @type {import('../types.js').Faction} */ (node.owner),
          type: /** @type {import('../types.js').NodeTypeId} */ (node.type),
          energy: typeof energyValue === 'number' ? Math.max(0, Math.round(energyValue)) : undefined,
        };
      }),
    };
  };

  const updateCanvasSize = () => {
    const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
    const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const clampNodesToBounds = () => {
    const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
    const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
    nodes = nodes.map((node) => ({
      ...node,
      x: clamp(node.x, 0, width),
      y: clamp(node.y, 0, height),
    }));
  };

  const renderNodes = () => {
    canvas.innerHTML = '';
    nodes.forEach((node) => {
      const nodeElement = document.createElement('button');
      nodeElement.type = 'button';
      nodeElement.className = 'editor-node';
      nodeElement.dataset.nodeId = node.id;
      nodeElement.style.setProperty('--node-color', NODE_COLORS[node.owner] ?? '#4b5563');
      nodeElement.style.setProperty('--node-radius', `${NODE_TYPE_RADIUS[node.type] ?? NODE_TYPE_RADIUS[DEFAULT_NODE_TYPE]}px`);
      nodeElement.style.left = `${node.x}px`;
      nodeElement.style.top = `${node.y}px`;
      nodeElement.textContent = node.id;
      if (node.id === selectedNodeId) {
        nodeElement.classList.add('editor-node--selected');
      }

      const pointerDown = (event) => {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        selectNode(node.id);
        const pointerId = event.pointerId;
        nodeElement.setPointerCapture(pointerId);
        const canvasRect = canvas.getBoundingClientRect();
        const offsetX = event.clientX - canvasRect.left - node.x;
        const offsetY = event.clientY - canvasRect.top - node.y;

        const handlePointerMove = (moveEvent) => {
          if (moveEvent.pointerId !== pointerId) {
            return;
          }
          const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
          const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
          const newX = clamp(moveEvent.clientX - canvasRect.left - offsetX, 0, width);
          const newY = clamp(moveEvent.clientY - canvasRect.top - offsetY, 0, height);
          node.x = newX;
          node.y = newY;
          nodeElement.style.left = `${newX}px`;
          nodeElement.style.top = `${newY}px`;
          nodeXInput.value = String(Math.round(newX));
          nodeYInput.value = String(Math.round(newY));
        };

        const endDrag = (endEvent) => {
          if (endEvent.pointerId !== pointerId) {
            return;
          }
          nodeElement.removeEventListener('pointermove', handlePointerMove);
          nodeElement.removeEventListener('pointerup', endDrag);
          nodeElement.removeEventListener('pointercancel', endDrag);
          nodeElement.releasePointerCapture(pointerId);
        };

        nodeElement.addEventListener('pointermove', handlePointerMove);
        nodeElement.addEventListener('pointerup', endDrag);
        nodeElement.addEventListener('pointercancel', endDrag);
      };

      nodeElement.addEventListener('pointerdown', pointerDown);
      nodeElement.addEventListener('click', () => {
        selectNode(node.id);
      });

      canvas.appendChild(nodeElement);
    });
  };

  const selectNode = (nodeId) => {
    const node = nodes.find((item) => item.id === nodeId) ?? null;
    selectedNodeId = node ? node.id : null;
    renderNodes();
    if (!node) {
      nodeIdInput.value = '';
      nodeOwnerSelect.value = OWNER_OPTIONS[0].id;
      nodeTypeSelect.value = NODE_TYPE_OPTIONS[1].id;
      nodeEnergyInput.value = '';
      nodeXInput.value = '';
      nodeYInput.value = '';
      nodeSection.classList.add('editor__section--disabled');
      removeNodeButton.disabled = true;
      return;
    }
    nodeSection.classList.remove('editor__section--disabled');
    removeNodeButton.disabled = false;
    nodeIdInput.value = node.id;
    nodeOwnerSelect.value = node.owner;
    nodeTypeSelect.value = node.type ?? DEFAULT_NODE_TYPE;
    nodeEnergyInput.value = typeof node.energy === 'number' ? String(Math.round(node.energy)) : '';
    nodeXInput.value = String(Math.round(node.x));
    nodeYInput.value = String(Math.round(node.y));
  };

  const ensureUniqueNodeId = (desiredId, fallbackId) => {
    let nextId = desiredId.trim();
    if (!nextId) {
      nextId = fallbackId;
    }
    if (!nodes.some((node) => node.id === nextId)) {
      return nextId;
    }
    let counter = 2;
    while (nodes.some((node) => node.id === `${nextId}-${counter}`)) {
      counter += 1;
    }
    return `${nextId}-${counter}`;
  };

  const generateNodeId = () => {
    const baseId = `node-${nodes.length + 1}`;
    if (!nodes.some((node) => node.id === baseId)) {
      return baseId;
    }
    let counter = nodes.length + 2;
    while (nodes.some((node) => node.id === `node-${counter}`)) {
      counter += 1;
    }
    return `node-${counter}`;
  };

  const refreshExport = () => {
    const definition = buildLevelDefinition();
    const constName = exportConstInput.value.trim() || toConstName(definition.id);
    exportConstInput.value = constName;
    exportOutput.value = formatLevel(definition, constName);
  };

  const applyLevelToInputs = (level) => {
    levelIdInput.value = level.id;
    levelNameInput.value = level.name ?? '';
    widthInput.value = String(level.width);
    heightInput.value = String(level.height);
    seedInput.value = level.seed !== undefined && level.seed !== null ? String(level.seed) : '';
    aiStrategyInput.value = level.aiStrategyId ?? '';
    exportConstInput.value = toConstName(level.id);
    updateCanvasSize();
  };

  const loadLevel = (definition) => {
    currentLevel = copyDefinition(definition);
    nodes = currentLevel.nodes.map((node) => ({
      id: node.id,
      x: sanitizeNumber(node.x, currentLevel.width / 2),
      y: sanitizeNumber(node.y, currentLevel.height / 2),
      owner: node.owner ?? 'neutral',
      type: node.type ?? DEFAULT_NODE_TYPE,
      energy: typeof node.energy === 'number' ? node.energy : undefined,
    }));
    selectedNodeId = null;
    applyLevelToInputs(currentLevel);
    clampNodesToBounds();
    renderNodes();
    selectNode(nodes[0]?.id ?? null);
    refreshExport();
  };

  const addNode = () => {
    const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
    const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
    const node = {
      id: generateNodeId(),
      owner: OWNER_OPTIONS[0].id,
      type: DEFAULT_NODE_TYPE,
      x: Math.round(width / 2),
      y: Math.round(height / 2),
      energy: 100,
    };
    nodes.push(node);
    renderNodes();
    selectNode(node.id);
    refreshExport();
  };

  const removeNode = () => {
    if (!selectedNodeId) {
      return;
    }
    nodes = nodes.filter((node) => node.id !== selectedNodeId);
    selectedNodeId = null;
    renderNodes();
    selectNode(nodes[0]?.id ?? null);
    refreshExport();
  };

  const open = () => {
    overlay.classList.add('editor-overlay--visible');
    refreshExport();
  };

  const close = () => {
    if (!overlay.classList.contains('editor-overlay--visible')) {
      return;
    }
    overlay.classList.remove('editor-overlay--visible');
    onClose();
  };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  });

  const isOpen = () => overlay.classList.contains('editor-overlay--visible');

  const setOnClose = (handler) => {
    onClose = handler;
  };

  levelIdInput.addEventListener('input', refreshExport);
  levelNameInput.addEventListener('input', refreshExport);
  aiStrategyInput.addEventListener('input', refreshExport);
  seedInput.addEventListener('input', refreshExport);

  const handleDimensionChange = () => {
    updateCanvasSize();
    clampNodesToBounds();
    renderNodes();
    refreshExport();
  };

  widthInput.addEventListener('input', handleDimensionChange);
  heightInput.addEventListener('input', handleDimensionChange);

  addNodeButton.addEventListener('click', () => {
    addNode();
  });

  removeNodeButton.addEventListener('click', () => {
    removeNode();
  });

  nodeIdInput.addEventListener('change', () => {
    if (!selectedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === selectedNodeId);
    if (!node) {
      return;
    }
    const desiredId = nodeIdInput.value.trim() || node.id;
    const uniqueId = ensureUniqueNodeId(desiredId, node.id);
    node.id = uniqueId;
    selectedNodeId = uniqueId;
    nodeIdInput.value = uniqueId;
    renderNodes();
    refreshExport();
  });

  nodeOwnerSelect.addEventListener('change', () => {
    if (!selectedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === selectedNodeId);
    if (!node) {
      return;
    }
    node.owner = nodeOwnerSelect.value;
    renderNodes();
    refreshExport();
  });

  nodeTypeSelect.addEventListener('change', () => {
    if (!selectedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === selectedNodeId);
    if (!node) {
      return;
    }
    node.type = nodeTypeSelect.value;
    renderNodes();
    refreshExport();
  });

  const updateNodePositionFromInputs = () => {
    if (!selectedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === selectedNodeId);
    if (!node) {
      return;
    }
    const width = sanitizePositiveInteger(widthInput.value, currentLevel.width);
    const height = sanitizePositiveInteger(heightInput.value, currentLevel.height);
    node.x = clamp(sanitizeNumber(nodeXInput.value, node.x), 0, width);
    node.y = clamp(sanitizeNumber(nodeYInput.value, node.y), 0, height);
    renderNodes();
    refreshExport();
  };

  nodeXInput.addEventListener('change', updateNodePositionFromInputs);
  nodeYInput.addEventListener('change', updateNodePositionFromInputs);

  nodeEnergyInput.addEventListener('change', () => {
    if (!selectedNodeId) {
      return;
    }
    const node = nodes.find((item) => item.id === selectedNodeId);
    if (!node) {
      return;
    }
    const value = nodeEnergyInput.value.trim();
    if (value === '') {
      delete node.energy;
    } else {
      const parsed = Math.max(0, sanitizeNumber(value, 0));
      node.energy = Math.round(parsed);
    }
    refreshExport();
  });

  exportButton.addEventListener('click', refreshExport);
  exportConstInput.addEventListener('input', refreshExport);

  closeButton.addEventListener('click', () => {
    close();
  });

  window.addEventListener('keydown', (event) => {
    if (!isOpen()) {
      return;
    }
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault();
      close();
    }
  });

  loadLevel(DEFAULT_LEVEL);

  return {
    overlay,
    open,
    close,
    isOpen,
    loadLevel,
    setOnClose,
    refreshExport,
    getLevelDefinition: buildLevelDefinition,
    setExportConstName: (name) => {
      exportConstInput.value = name.trim();
      refreshExport();
    },
    selectNode,
  };
}
