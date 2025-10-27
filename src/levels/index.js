import { levelOne } from './level-one.js';
import { levelTwo } from './level-two.js';
import { levelThree } from './level-three.js';
import { levelFour } from './level-four.js';
import { levelFive } from './level-five.js';
import { levelSix } from './level-six.js';
import { levelSeven } from './level-seven.js';
import { levelEight } from './level-eight.js';
import { levelNine } from './level-nine.js';
import { levelTen } from './level-ten.js';

const levelRegistry = [
  levelOne,
  levelTwo,
  levelThree,
  levelFour,
  levelFive,
  levelSix,
  levelSeven,
  levelEight,
  levelNine,
  levelTen,
];

export class LevelManager {
  /**
   * @param {import('../types.js').LevelDefinition[]} levels
   */
  constructor(levels) {
    this.levels = levels;
    this.currentLevelId = levels[0]?.id ?? null;
  }

  getLevels() {
    return this.levels.map((level) => ({
      id: level.id,
      name: level.name,
    }));
  }

  getLevelById(id) {
    return this.levels.find((level) => level.id === id) ?? null;
  }

  getDefaultLevel() {
    return this.levels[0] ?? null;
  }

  getCurrentLevel() {
    if (this.currentLevelId) {
      const currentLevel = this.getLevelById(this.currentLevelId);
      if (currentLevel) {
        return currentLevel;
      }
    }
    const fallback = this.getDefaultLevel();
    this.currentLevelId = fallback?.id ?? null;
    return fallback;
  }

  /**
   * @param {string} levelId
   */
  setCurrentLevel(levelId) {
    const level = this.getLevelById(levelId);
    if (!level) {
      return null;
    }
    this.currentLevelId = level.id;
    return level;
  }
}

export const levelManager = new LevelManager(levelRegistry);

export {
  levelOne,
  levelTwo,
  levelThree,
  levelFour,
  levelFive,
  levelSix,
  levelSeven,
  levelEight,
  levelNine,
  levelTen,
};
