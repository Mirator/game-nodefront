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
import { levelEleven } from './level-eleven.js';
import { levelTwelve } from './level-twelve.js';
import { levelThirteen } from './level-thirteen.js';
import { levelFourteen } from './level-fourteen.js';
import { levelFifteen } from './level-fifteen.js';

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
  levelEleven,
  levelTwelve,
  levelThirteen,
  levelFourteen,
  levelFifteen,
];

export class LevelManager {
  /**
   * @param {import('../types.js').LevelDefinition[]} levels
   */
  constructor(levels) {
    this.levels = levels;
    /** @type {Set<string>} */
    this.unlockedLevelIds = new Set();
    const firstLevelId = levels[0]?.id ?? null;
    if (firstLevelId) {
      this.unlockedLevelIds.add(firstLevelId);
    }
    /** @type {string | null} */
    this.currentLevelId = firstLevelId;
  }

  getLevels() {
    return this.levels.map((level) => ({
      id: level.id,
      name: level.name,
      locked: !this.isLevelUnlocked(level.id),
    }));
  }

  getLevelById(id) {
    return this.levels.find((level) => level.id === id) ?? null;
  }

  getDefaultLevel() {
    return this.levels[0] ?? null;
  }

  getCurrentLevel() {
    if (this.currentLevelId && this.isLevelUnlocked(this.currentLevelId)) {
      const currentLevel = this.getLevelById(this.currentLevelId);
      if (currentLevel) {
        return currentLevel;
      }
    }

    const fallback =
      this.levels.find((level) => this.isLevelUnlocked(level.id)) ?? this.getDefaultLevel();
    this.currentLevelId = fallback?.id ?? null;
    return fallback ?? null;
  }

  /**
   * @param {string} levelId
   */
  setCurrentLevel(levelId) {
    const level = this.getLevelById(levelId);
    if (!level || !this.isLevelUnlocked(level.id)) {
      return null;
    }
    this.currentLevelId = level.id;
    return level;
  }

  /**
   * @param {string} levelId
   * @returns {boolean}
   */
  unlockLevel(levelId) {
    const level = this.getLevelById(levelId);
    if (!level || this.isLevelUnlocked(level.id)) {
      return false;
    }
    this.unlockedLevelIds.add(level.id);
    if (!this.currentLevelId) {
      this.currentLevelId = level.id;
    }
    return true;
  }

  /**
   * @param {ReadonlyArray<string>} levelIds
   */
  setUnlockedLevels(levelIds) {
    const validIds = new Set(this.levels.map((level) => level.id));
    this.unlockedLevelIds.clear();
    for (const id of levelIds) {
      if (validIds.has(id)) {
        this.unlockedLevelIds.add(id);
      }
    }

    if (this.unlockedLevelIds.size === 0) {
      const fallback = this.getDefaultLevel();
      if (fallback) {
        this.unlockedLevelIds.add(fallback.id);
      }
    }

    if (!this.currentLevelId || !this.isLevelUnlocked(this.currentLevelId)) {
      const current = this.getCurrentLevel();
      this.currentLevelId = current?.id ?? null;
    }
  }

  /**
   * @returns {string[]}
   */
  getUnlockedLevelIds() {
    return this.levels
      .filter((level) => this.unlockedLevelIds.has(level.id))
      .map((level) => level.id);
  }

  /**
   * @param {string} levelId
   * @returns {boolean}
   */
  isLevelUnlocked(levelId) {
    return this.unlockedLevelIds.has(levelId);
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
  levelEleven,
  levelTwelve,
  levelThirteen,
  levelFourteen,
  levelFifteen,
};
