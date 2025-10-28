import { FlowgridGame } from './game/index.js';
import { levelManager } from './levels/index.js';

/** @type {HTMLDivElement | null} */
const app = document.querySelector('#app');
if (!app) {
  throw new Error('App root not found');
}

const container = document.createElement('div');
container.className = 'game-container';
app.appendChild(container);

const canvas = document.createElement('canvas');
container.appendChild(canvas);

const hud = document.createElement('div');
hud.className = 'hud';
container.appendChild(hud);

const title = document.createElement('div');
hud.appendChild(title);

const pauseIndicator = document.createElement('div');
pauseIndicator.className = 'pause-indicator';
container.appendChild(pauseIndicator);

const topRightHud = document.createElement('div');
topRightHud.className = 'top-right-hud';
container.appendChild(topRightHud);

const energyDisplay = document.createElement('div');
energyDisplay.className = 'energy-summary';
topRightHud.appendChild(energyDisplay);

const energyTitle = document.createElement('div');
energyTitle.className = 'energy-summary__title';
energyTitle.textContent = 'Energy';
energyDisplay.appendChild(energyTitle);

const energyValuesContainer = document.createElement('div');
energyValuesContainer.className = 'energy-summary__values';
energyDisplay.appendChild(energyValuesContainer);

const createEnergyEntry = (faction, label) => {
  const entry = document.createElement('div');
  entry.className = `energy-summary__entry energy-summary__entry--${faction}`;

  const entryLabel = document.createElement('span');
  entryLabel.className = 'energy-summary__label';
  entryLabel.textContent = label;
  entry.appendChild(entryLabel);

  const entryValue = document.createElement('span');
  entryValue.className = 'energy-summary__value';
  entryValue.textContent = '0';
  entryValue.dataset.faction = faction;
  entry.appendChild(entryValue);

  energyValuesContainer.appendChild(entry);
  return entryValue;
};

/** @type {Record<'player' | 'ai' | 'neutral', HTMLSpanElement>} */
const energyValues = {
  player: createEnergyEntry('player', 'Player'),
  ai: createEnergyEntry('ai', 'AI'),
  neutral: createEnergyEntry('neutral', 'Neutral'),
};

const legend = document.createElement('div');
legend.className = 'legend';
topRightHud.appendChild(legend);

const controlsBar = document.createElement('div');
controlsBar.className = 'top-controls';
container.appendChild(controlsBar);

const newGameButton = document.createElement('button');
newGameButton.type = 'button';
newGameButton.className = 'top-controls__button';
newGameButton.textContent = 'New Game';
controlsBar.appendChild(newGameButton);

const prompt = document.createElement('div');
prompt.className = 'prompt';
container.appendChild(prompt);

const aiFootnote = document.createElement('div');
aiFootnote.className = 'ai-footnote';
aiFootnote.style.display = 'none';
container.appendChild(aiFootnote);

const endScreen = document.createElement('div');
endScreen.className = 'end-screen';
const endHeadline = document.createElement('h1');
const endActions = document.createElement('div');
endActions.className = 'end-screen__actions';
const restartButton = document.createElement('button');
restartButton.type = 'button';
restartButton.textContent = 'Restart';
const nextLevelButton = document.createElement('button');
nextLevelButton.type = 'button';
nextLevelButton.className = 'end-screen__next';
nextLevelButton.textContent = 'Choose Next Level';
endActions.appendChild(restartButton);
endActions.appendChild(nextLevelButton);
endScreen.appendChild(endHeadline);
endScreen.appendChild(endActions);
endScreen.style.display = 'none';
container.appendChild(endScreen);

const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
container.appendChild(menuOverlay);

const menu = document.createElement('div');
menu.className = 'menu';
menuOverlay.appendChild(menu);

const menuTitle = document.createElement('h2');
menuTitle.textContent = 'New Game';
menu.appendChild(menuTitle);

const menuForm = document.createElement('form');
menuForm.className = 'menu__form';
menu.appendChild(menuForm);

const levelLabel = document.createElement('p');
levelLabel.className = 'menu__label';
levelLabel.textContent = 'Select Level';
menuForm.appendChild(levelLabel);

const levelGrid = document.createElement('div');
levelGrid.className = 'menu__level-grid';
menuForm.appendChild(levelGrid);

/** @type {Map<string, HTMLButtonElement>} */
const levelButtons = new Map();

/** @type {string} */
let currentLevelId = '';

const selectLevel = (levelId) => {
  const button = levelButtons.get(levelId);
  if (!button || button.classList.contains('menu__level-button--locked')) {
    return;
  }
  currentLevelId = levelId;
  for (const [id, levelButton] of levelButtons.entries()) {
    const isSelected = id === currentLevelId;
    levelButton.classList.toggle('menu__level-button--selected', isSelected);
    levelButton.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    const isLocked = levelButton.classList.contains('menu__level-button--locked');
    levelButton.setAttribute('aria-disabled', isLocked ? 'true' : 'false');
  }
};

const menuActions = document.createElement('div');
menuActions.className = 'menu__actions';
menuForm.appendChild(menuActions);

const cancelButton = document.createElement('button');
cancelButton.type = 'button';
cancelButton.className = 'menu__cancel';
cancelButton.textContent = 'Cancel';
menuActions.appendChild(cancelButton);

const startButton = document.createElement('button');
startButton.type = 'submit';
startButton.className = 'menu__start';
startButton.textContent = 'Start Level';
menuActions.appendChild(startButton);

const availableLevels = levelManager.getLevels();
const defaultLevel = levelManager.getDefaultLevel();
if (!defaultLevel) {
  throw new Error('No levels available.');
}

currentLevelId = defaultLevel.id;
levelManager.setCurrentLevel(currentLevelId);

const findLevelIndex = (id) =>
  availableLevels.findIndex((level) => level.id === id);

const getNextLevelId = (id) => {
  const currentIndex = findLevelIndex(id);
  if (currentIndex >= 0 && currentIndex < availableLevels.length - 1) {
    return availableLevels[currentIndex + 1].id;
  }
  return null;
};

availableLevels.forEach((level, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'menu__level-button';
  button.dataset.levelId = level.id;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-disabled', 'false');
  button.setAttribute('aria-label', `${index + 1}. ${level.name}`);
  button.title = level.name;

  const card = document.createElement('span');
  card.className = 'menu__level-card';

  const levelNumber = document.createElement('span');
  levelNumber.className = 'menu__level-number';
  levelNumber.textContent = `Level ${String(index + 1).padStart(2, '0')}`;

  const levelName = document.createElement('span');
  levelName.className = 'menu__level-name';
  levelName.textContent = level.name;

  card.appendChild(levelNumber);
  card.appendChild(levelName);
  button.appendChild(card);

  button.addEventListener('click', () => {
    if (button.classList.contains('menu__level-button--locked')) {
      return;
    }
    selectLevel(level.id);
  });

  levelButtons.set(level.id, button);
  levelGrid.appendChild(button);
});

selectLevel(currentLevelId);

/** @type {import('./types.js').GameConfig} */
const config = {
  fixedStep: 1 / 60,
  maxFrameDelta: 0.25,
  distanceLoss: 0.001,
  efficiencyFloor: 0.35,
  captureSeed: 5,
  safetyReserve: 10,
  linkMaxRate: 20,
  surplusThreshold: 20,
  regenRateMultiplier: 0.6,
  aiInitialDelay: 2.5,
  aiNodeAttackDelay: 1,
};

const game = new FlowgridGame(
  canvas,
  {
    title,
    legend,
    prompt,
    pauseIndicator,
    endScreen,
    endHeadline,
    restartButton,
    energyValues,
  },
  defaultLevel,
  config,
);

game.start();

const updateAiFootnote = () => {
  const label = game.getAiStrategyLabel();
  if (label) {
    aiFootnote.textContent = `AI Strategy: ${label}`;
    aiFootnote.style.display = 'block';
  } else {
    aiFootnote.textContent = '';
    aiFootnote.style.display = 'none';
  }
};

updateAiFootnote();

let resumeAfterMenu = false;
let wasPausedBeforeMenu = false;

const closeMenu = ({ resume = resumeAfterMenu } = {}) => {
  if (!menuOverlay.classList.contains('menu-overlay--visible')) {
    return;
  }
  menuOverlay.classList.remove('menu-overlay--visible');
  if (resume) {
    game.resume();
  } else if (wasPausedBeforeMenu) {
    game.pause();
  }
  resumeAfterMenu = false;
};

const openMenu = ({ resumeOnClose = true } = {}) => {
  if (menuOverlay.classList.contains('menu-overlay--visible')) {
    return;
  }
  wasPausedBeforeMenu = game.isPaused();
  resumeAfterMenu = resumeOnClose && !wasPausedBeforeMenu;
  game.pause(false);
  selectLevel(currentLevelId);
  menuOverlay.classList.add('menu-overlay--visible');
};

newGameButton.addEventListener('click', () => {
  openMenu({ resumeOnClose: true });
});

cancelButton.addEventListener('click', () => {
  closeMenu();
});

menuForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const selectedLevel = levelManager.getLevelById(currentLevelId);
  if (!selectedLevel) {
    return;
  }
  currentLevelId = selectedLevel.id;
  levelManager.setCurrentLevel(selectedLevel.id);
  game.loadLevel(selectedLevel);
  updateAiFootnote();
  if (!game.isRunning()) {
    game.start();
  }
  closeMenu({ resume: true });
});

nextLevelButton.addEventListener('click', () => {
  const upcomingLevelId = getNextLevelId(currentLevelId);
  if (upcomingLevelId) {
    selectLevel(upcomingLevelId);
  }
  endScreen.style.display = 'none';
  openMenu({ resumeOnClose: false });
});

// Allow the player to choose their starting level immediately.
openMenu({ resumeOnClose: false });
