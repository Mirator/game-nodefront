import { FlowgridGame } from './game/index.js';
import { levelManager } from './levels/index.js';
import { createHud } from './ui/hud.js';
import { createMenu } from './ui/menu.js';
import { storage } from './utils/storage.js';

const STORAGE_KEYS = {
  PROGRESS: 'flowgrid:progress',
  OPTIONS: 'flowgrid:options',
};

/** @type {HTMLDivElement | null} */
const app = document.querySelector('#app');
if (!app) {
  throw new Error('App root not found');
}

const hud = createHud(app);
const menu = createMenu(hud.container);

const rawProgress = storage.get(STORAGE_KEYS.PROGRESS, null);
const progressFromStorage =
  rawProgress &&
  typeof rawProgress === 'object' &&
  Array.isArray(rawProgress.unlockedLevelIds)
    ? rawProgress
    : null;

if (progressFromStorage) {
  levelManager.setUnlockedLevels(progressFromStorage.unlockedLevelIds);
}

const unlockedSnapshot = levelManager.getUnlockedLevelIds();
const shouldPersistInitialProgress =
  !progressFromStorage ||
  progressFromStorage.unlockedLevelIds.length !== unlockedSnapshot.length ||
  progressFromStorage.unlockedLevelIds.some((id, index) => id !== unlockedSnapshot[index]);

const fallbackLevel = levelManager.getCurrentLevel() ?? levelManager.getDefaultLevel();
if (!fallbackLevel) {
  throw new Error('No levels available.');
}

let currentLevelId = fallbackLevel.id;
let isGodModeEnabled = false;

let shouldPersistInitialOptions = false;
const rawOptions = storage.get(STORAGE_KEYS.OPTIONS, null);
const optionsFromStorage =
  rawOptions &&
  typeof rawOptions === 'object' &&
  typeof rawOptions.selectedLevelId === 'string'
    ? rawOptions
    : null;

if (optionsFromStorage) {
  const selectedLevel = levelManager.setCurrentLevel(optionsFromStorage.selectedLevelId);
  if (selectedLevel) {
    currentLevelId = selectedLevel.id;
  } else {
    const ensuredLevel = levelManager.getCurrentLevel();
    if (ensuredLevel) {
      currentLevelId = ensuredLevel.id;
    }
    shouldPersistInitialOptions = true;
  }
} else {
  const ensuredLevel = levelManager.setCurrentLevel(currentLevelId) ?? levelManager.getCurrentLevel();
  if (ensuredLevel) {
    currentLevelId = ensuredLevel.id;
  }
  shouldPersistInitialOptions = true;
}

const persistProgress = () => {
  storage.set(STORAGE_KEYS.PROGRESS, {
    unlockedLevelIds: levelManager.getUnlockedLevelIds(),
  });
};

const persistOptions = () => {
  if (isGodModeEnabled && !levelManager.isLevelUnlocked(currentLevelId)) {
    return;
  }
  storage.set(STORAGE_KEYS.OPTIONS, {
    selectedLevelId: currentLevelId,
  });
};

const getLevelsForMenu = () => {
  const levels = levelManager.getLevels();
  if (!isGodModeEnabled) {
    return levels;
  }
  return levels.map((level) => ({ ...level, locked: false }));
};

const ensureCurrentLevelPlayable = () => {
  if (isGodModeEnabled || levelManager.isLevelUnlocked(currentLevelId)) {
    return;
  }
  const ensuredLevel = levelManager.getCurrentLevel();
  if (ensuredLevel) {
    currentLevelId = ensuredLevel.id;
    persistOptions();
  }
};

const updateMenuLevels = () => {
  menu.setLevels(getLevelsForMenu(), { selectedLevelId: currentLevelId });
  const selectedId = menu.getSelectedLevelId();
  if (selectedId) {
    currentLevelId = selectedId;
  }
};

menu.setOnLevelSelected((levelId) => {
  const levelDefinition = levelManager.getLevelById(levelId);
  if (!levelDefinition) {
    updateMenuLevels();
    return;
  }
  if (!isGodModeEnabled) {
    const selectedLevel = levelManager.setCurrentLevel(levelId);
    if (!selectedLevel) {
      updateMenuLevels();
      return;
    }
  } else if (levelManager.isLevelUnlocked(levelId)) {
    levelManager.setCurrentLevel(levelId);
  }
  currentLevelId = levelDefinition.id;
  persistOptions();
});

updateMenuLevels();

if (shouldPersistInitialProgress) {
  persistProgress();
}
if (shouldPersistInitialOptions) {
  persistOptions();
}

const initialLevel = levelManager.getCurrentLevel();
if (!initialLevel) {
  throw new Error('No levels available.');
}

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
  initialLevel,
  config,
);

game.start();

const updateAiFootnote = () => {
  const label = game.getAiStrategyLabel();
  hud.setAiStrategyLabel(label);
};

updateAiFootnote();

game.setOnWinnerChange((faction) => {
  if (faction !== 'player') {
    return;
  }
  const upcomingLevelId = menu.getNextLevelId(currentLevelId);
  if (!upcomingLevelId) {
    persistProgress();
    return;
  }
  const unlocked = levelManager.unlockLevel(upcomingLevelId);
  if (unlocked) {
    persistProgress();
    updateMenuLevels();
  }
});

const setGodModeEnabled = (enabled) => {
  if (isGodModeEnabled === enabled) {
    return;
  }
  isGodModeEnabled = enabled;
  if (!isGodModeEnabled) {
    ensureCurrentLevelPlayable();
  }
  hud.setGodModeIndicator(isGodModeEnabled);
  updateMenuLevels();
};

window.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) {
    return;
  }
  if (event.key !== 'g' && event.key !== 'G') {
    return;
  }
  if (event.repeat) {
    return;
  }
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target && 'isContentEditable' in target && target.isContentEditable)
  ) {
    return;
  }
  setGodModeEnabled(!isGodModeEnabled);
});

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
  ensureCurrentLevelPlayable();
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
  const selectedLevelId = menu.getSelectedLevelId();
  const selectedLevel = levelManager.getLevelById(selectedLevelId);
  if (!selectedLevel) {
    return;
  }
  currentLevelId = selectedLevel.id;
  if (!isGodModeEnabled || levelManager.isLevelUnlocked(selectedLevel.id)) {
    levelManager.setCurrentLevel(selectedLevel.id);
  }
  persistOptions();
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
