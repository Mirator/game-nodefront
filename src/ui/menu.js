/**
 * @typedef {{ id: string; name: string; locked?: boolean }} LevelSummary
 */

/**
 * Creates the level selection menu overlay and provides helpers for interacting with it.
 *
 * @param {HTMLElement} root
 */
export function createMenu(root) {
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  root.appendChild(overlay);

  const menu = document.createElement('div');
  menu.className = 'menu';
  overlay.appendChild(menu);

  const menuTitle = document.createElement('h2');
  menuTitle.textContent = 'New Game';
  menu.appendChild(menuTitle);

  const form = document.createElement('form');
  form.className = 'menu__form';
  menu.appendChild(form);

  const levelLabel = document.createElement('p');
  levelLabel.className = 'menu__label';
  levelLabel.textContent = 'Select Level';
  form.appendChild(levelLabel);

  const levelGrid = document.createElement('div');
  levelGrid.className = 'menu__level-grid';
  form.appendChild(levelGrid);

  const menuActions = document.createElement('div');
  menuActions.className = 'menu__actions';
  form.appendChild(menuActions);

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

  /** @type {Map<string, HTMLButtonElement>} */
  const levelButtons = new Map();
  /** @type {string} */
  let currentLevelId = '';
  /** @type {LevelSummary[]} */
  let levelOrder = [];
  /** @type {(levelId: string) => void} */
  let onLevelSelected = () => {};

  const isLocked = (button) => button.classList.contains('menu__level-button--locked');

  const applySelectionState = () => {
    for (const [id, button] of levelButtons.entries()) {
      const selected = id === currentLevelId;
      button.classList.toggle('menu__level-button--selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      button.setAttribute('aria-disabled', isLocked(button) ? 'true' : 'false');
    }
  };

  const selectLevel = (levelId) => {
    const button = levelButtons.get(levelId);
    if (!button || isLocked(button)) {
      return false;
    }
    currentLevelId = levelId;
    applySelectionState();
    onLevelSelected(currentLevelId);
    return true;
  };

  const open = () => {
    overlay.classList.add('menu-overlay--visible');
  };

  const close = () => {
    overlay.classList.remove('menu-overlay--visible');
  };

  const setLevels = (levels, { selectedLevelId } = {}) => {
    levelGrid.innerHTML = '';
    levelButtons.clear();
    levelOrder = levels.map((level) => ({ ...level }));

    levels.forEach((level, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu__level-button';
      if (level.locked) {
        button.classList.add('menu__level-button--locked');
      }
      button.dataset.levelId = level.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-disabled', 'false');
      button.setAttribute('aria-label', level.name ? `Level ${index + 1}: ${level.name}` : `Level ${index + 1}`);
      if (level.name) {
        button.title = level.name;
      }

      const card = document.createElement('span');
      card.className = 'menu__level-card';

      const levelNumber = document.createElement('span');
      levelNumber.className = 'menu__level-number';
      levelNumber.textContent = String(index + 1).padStart(2, '0');

      card.appendChild(levelNumber);
      button.appendChild(card);

      const handleLevelSelection = () => {
        if (isLocked(button)) {
          return;
        }
        selectLevel(level.id);
      };

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) {
          return;
        }
        handleLevelSelection();
      });

      button.addEventListener('click', () => {
        handleLevelSelection();
      });

      levelButtons.set(level.id, button);
      levelGrid.appendChild(button);
    });

    const firstUnlockedId = levelOrder.find((level) => !level.locked)?.id ?? '';
    /** @type {string[]} */
    const selectionCandidates = [];
    for (const candidate of [selectedLevelId, currentLevelId, firstUnlockedId]) {
      if (candidate && !selectionCandidates.includes(candidate)) {
        selectionCandidates.push(candidate);
      }
    }

    let selectionApplied = false;
    for (const candidate of selectionCandidates) {
      if (selectLevel(candidate)) {
        selectionApplied = true;
        break;
      }
    }

    if (!selectionApplied) {
      currentLevelId = '';
      applySelectionState();
    }
  };

  const getSelectedLevelId = () => currentLevelId;

  const setCurrentLevel = (levelId) => {
    if (selectLevel(levelId)) {
      return;
    }
    const fallbackId = levelOrder.find((level) => !level.locked)?.id ?? '';
    if (fallbackId) {
      selectLevel(fallbackId);
    } else {
      currentLevelId = '';
      applySelectionState();
    }
  };

  const getNextLevelId = (levelId = currentLevelId) => {
    if (!levelId) {
      return null;
    }
    const index = levelOrder.findIndex((level) => level.id === levelId);
    if (index >= 0 && index < levelOrder.length - 1) {
      return levelOrder[index + 1].id;
    }
    return null;
  };

  const isOpen = () => overlay.classList.contains('menu-overlay--visible');

  const setOnLevelSelected = (handler) => {
    onLevelSelected = handler;
  };

  return {
    overlay,
    form,
    cancelButton,
    startButton,
    open,
    close,
    isOpen,
    setLevels,
    getSelectedLevelId,
    setCurrentLevel,
    getNextLevelId,
    setOnLevelSelected,
  };
}
