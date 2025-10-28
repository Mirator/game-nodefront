import { FlowgridGame } from './game/index.js';
import { levelManager } from './levels/index.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';

/** @type {HTMLDivElement | null} */
const app = document.querySelector('#app');
if (!app) {
  throw new Error('App root not found');
}

const hud = createHud(app);
const menu = createMenu(hud.container);

const availableLevels = levelManager.getLevels();
const defaultLevel = levelManager.getDefaultLevel();
if (!defaultLevel) {
  throw new Error('No levels available.');
}

let currentLevelId = defaultLevel.id;

menu.setOnLevelSelected((levelId) => {
  currentLevelId = levelId;
});

menu.setLevels(availableLevels, { selectedLevelId: currentLevelId });
levelManager.setCurrentLevel(currentLevelId);

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
  hud.canvas,
  hud.hudElements,
  defaultLevel,
  config,
);

game.start();

const updateAiFootnote = () => {
  const label = game.getAiStrategyLabel();
  hud.setAiStrategyLabel(label);
};

updateAiFootnote();

let resumeAfterMenu = false;
let wasPausedBeforeMenu = false;

const closeMenu = ({ resume = resumeAfterMenu } = {}) => {
  if (!menu.isOpen()) {
    return;
  }
  menu.close();
  if (resume) {
    game.resume();
  } else if (wasPausedBeforeMenu) {
    game.pause();
  }
  resumeAfterMenu = false;
};

const openMenu = ({ resumeOnClose = true } = {}) => {
  if (menu.isOpen()) {
    return;
  }
  wasPausedBeforeMenu = game.isPaused();
  resumeAfterMenu = resumeOnClose && !wasPausedBeforeMenu;
  game.pause(false);
  menu.setCurrentLevel(currentLevelId);
  menu.open();
};

hud.newGameButton.addEventListener('click', () => {
  openMenu({ resumeOnClose: true });
});

menu.cancelButton.addEventListener('click', () => {
  closeMenu();
});

menu.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const selectedLevel = levelManager.getLevelById(menu.getSelectedLevelId());
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

hud.nextLevelButton.addEventListener('click', () => {
  const upcomingLevelId = menu.getNextLevelId(currentLevelId);
  if (upcomingLevelId) {
    menu.setCurrentLevel(upcomingLevelId);
  }
  hud.endScreen.style.display = 'none';
  openMenu({ resumeOnClose: false });
});

// Allow the player to choose their starting level immediately.
openMenu({ resumeOnClose: false });
