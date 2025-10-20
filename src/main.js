import { FlowgridGame } from './game.js';
import { levelOne } from './level.js';

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
};

new FlowgridGame(
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
  levelOne,
  config,
);
