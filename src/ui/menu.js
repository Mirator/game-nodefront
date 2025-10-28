/**
 * @typedef {{ id: string; name: string }} LevelSummary
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
      return;
    }
    currentLevelId = levelId;
    applySelectionState();
    onLevelSelected(currentLevelId);
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
    levelOrder = levels.slice();

    levels.forEach((level, index) => {
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
        if (isLocked(button)) {
          return;
        }
        selectLevel(level.id);
      });

      levelButtons.set(level.id, button);
      levelGrid.appendChild(button);
    });

    const initialSelection = selectedLevelId ?? levels[0]?.id ?? '';
    if (initialSelection) {
      selectLevel(initialSelection);
    } else {
      applySelectionState();
    }
  };

  const getSelectedLevelId = () => currentLevelId;

  const setCurrentLevel = (levelId) => {
    selectLevel(levelId);
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
