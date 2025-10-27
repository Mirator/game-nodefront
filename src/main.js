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

const legend = document.createElement('div');
legend.className = 'legend';
container.appendChild(legend);

const controlsBar = document.createElement('div');
controlsBar.className = 'top-controls';
container.appendChild(controlsBar);

const newGameButton = document.createElement('button');
newGameButton.type = 'button';
newGameButton.className = 'top-controls__button';
newGameButton.textContent = 'New Game';
controlsBar.appendChild(newGameButton);

const aiControls = document.createElement('div');
aiControls.className = 'ai-controls';
container.appendChild(aiControls);

const aiLabel = document.createElement('label');
aiLabel.className = 'ai-controls__label';
aiLabel.textContent = 'AI Strategy';
aiLabel.htmlFor = 'ai-strategy-select';
aiControls.appendChild(aiLabel);

const aiSelect = document.createElement('select');
aiSelect.id = 'ai-strategy-select';
aiSelect.name = 'ai-strategy-select';
aiControls.appendChild(aiSelect);

const prompt = document.createElement('div');
prompt.className = 'prompt';
container.appendChild(prompt);

const endScreen = document.createElement('div');
endScreen.className = 'end-screen';
const endHeadline = document.createElement('h1');
const restartButton = document.createElement('button');
restartButton.textContent = 'Restart';
endScreen.appendChild(endHeadline);
endScreen.appendChild(restartButton);
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

const levelLabel = document.createElement('label');
levelLabel.className = 'menu__label';
levelLabel.htmlFor = 'level-select';
levelLabel.textContent = 'Select Level';
menuForm.appendChild(levelLabel);

const levelSelect = document.createElement('select');
levelSelect.id = 'level-select';
levelSelect.name = 'level-select';
menuForm.appendChild(levelSelect);

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

for (const level of availableLevels) {
  const option = document.createElement('option');
  option.value = level.id;
  option.textContent = level.name;
  levelSelect.appendChild(option);
}

let currentLevelId = defaultLevel.id;
levelManager.setCurrentLevel(currentLevelId);

/** @type {import('./types.js').GameConfig} */
const config = {
  fixedStep: 1 / 60,
  distanceLoss: 0.001,
  efficiencyFloor: 0.35,
  captureSeed: 5,
  safetyReserve: 10,
  outgoingLimit: 3,
  linkMaxRate: 20,
  surplusThreshold: 20,
  regenRateMultiplier: 0.6,
  sharePresets: {
    '1': 0.25,
    '2': 0.5,
    '3': 1,
  },
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
  },
  defaultLevel,
  config,
);

game.start();

for (const strategy of game.getAvailableStrategies()) {
  const option = document.createElement('option');
  option.value = strategy.id;
  option.textContent = strategy.label;
  aiSelect.appendChild(option);
}

aiSelect.value = game.getAiStrategyId();
aiSelect.addEventListener('change', () => {
  game.setAiStrategy(aiSelect.value);
});

levelSelect.value = currentLevelId;

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
  levelSelect.value = currentLevelId;
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
  const selectedLevel = levelManager.getLevelById(levelSelect.value);
  if (!selectedLevel) {
    return;
  }
  currentLevelId = selectedLevel.id;
  levelManager.setCurrentLevel(selectedLevel.id);
  game.loadLevel(selectedLevel);
  if (!game.isRunning()) {
    game.start();
  }
  closeMenu({ resume: true });
});

// Allow the player to choose their starting level immediately.
openMenu({ resumeOnClose: false });
