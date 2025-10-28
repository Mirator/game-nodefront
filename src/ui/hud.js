/**
 * @typedef {import('../types.js').Faction} Faction
 */

/**
 * Creates the game's HUD, canvas, and surrounding container elements.
 *
 * @param {HTMLElement} root
 */
export function createHud(root) {
  const container = document.createElement('div');
  container.className = 'game-container';
  root.appendChild(container);

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

  const energyContent = document.createElement('div');
  energyContent.className = 'energy-summary__content';
  energyDisplay.appendChild(energyContent);

  const energyChart = document.createElement('div');
  energyChart.className = 'energy-summary__chart';
  energyContent.appendChild(energyChart);

  const energyTotal = document.createElement('div');
  energyTotal.className = 'energy-summary__total';
  energyTotal.textContent = '0';
  energyChart.appendChild(energyTotal);

  const energyValuesContainer = document.createElement('div');
  energyValuesContainer.className = 'energy-summary__values';
  energyContent.appendChild(energyValuesContainer);

  /**
   * @param {Faction | 'neutral'} faction
   * @param {string} label
   */
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

  /** @type {Record<Faction | 'neutral', HTMLSpanElement>} */
  const energyValues = {
    player: createEnergyEntry('player', 'Player'),
    'ai-red': createEnergyEntry('ai-red', 'Red AI'),
    'ai-purple': createEnergyEntry('ai-purple', 'Purple AI'),
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

  const godModeIndicator = document.createElement('div');
  godModeIndicator.className = 'god-mode-indicator';
  godModeIndicator.textContent = 'God Mode';
  godModeIndicator.setAttribute('aria-hidden', 'true');
  container.appendChild(godModeIndicator);

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

  const setAiStrategyLabel = (label) => {
    if (label) {
      aiFootnote.textContent = `AI Strategy: ${label}`;
      aiFootnote.style.display = 'block';
    } else {
      aiFootnote.textContent = '';
      aiFootnote.style.display = 'none';
    }
  };

  const setGodModeIndicator = (enabled) => {
    godModeIndicator.classList.toggle('god-mode-indicator--visible', enabled);
    godModeIndicator.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  };

  setGodModeIndicator(false);

  return {
    container,
    canvas,
    hudElements: {
      title,
      legend,
      prompt,
      pauseIndicator,
      endScreen,
      endHeadline,
      restartButton,
      energyValues,
      energyChart,
      energyTotal,
    },
    newGameButton,
    nextLevelButton,
    endScreen,
    setAiStrategyLabel,
    setGodModeIndicator,
  };
}
