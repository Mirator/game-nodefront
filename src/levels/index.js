import { levelOne } from './level-one.js';

const levelRegistry = [levelOne];

export function getLevels() {
  return levelRegistry.map((level) => ({
    id: level.id,
    name: level.name,
  }));
}

export function getLevelById(id) {
  return levelRegistry.find((level) => level.id === id) ?? null;
}

export function getDefaultLevel() {
  return levelRegistry[0] ?? null;
}

export { levelOne };
