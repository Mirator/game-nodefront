const isBrowser = typeof window !== 'undefined';

/** @type {Storage | null} */
let availableStorage = null;

if (isBrowser) {
  try {
    const testKey = '__flowgrid_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    availableStorage = window.localStorage;
  } catch (error) {
    availableStorage = null;
  }
}

/**
 * Safely reads and parses JSON from localStorage.
 *
 * @template T
 * @param {string} key
 * @param {T} [fallback]
 * @returns {T | null}
 */
function getItem(key, fallback = null) {
  if (!availableStorage) {
    return fallback ?? null;
  }

  try {
    const raw = availableStorage.getItem(key);
    if (raw === null) {
      return fallback ?? null;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallback ?? null;
  }
}

/**
 * Safely stringifies and writes JSON to localStorage.
 *
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
function setItem(key, value) {
  if (!availableStorage) {
    return false;
  }

  try {
    if (value === undefined) {
      availableStorage.removeItem(key);
      return true;
    }
    availableStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Removes an item from localStorage if available.
 *
 * @param {string} key
 * @returns {boolean}
 */
function removeItem(key) {
  if (!availableStorage) {
    return false;
  }

  try {
    availableStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

export const storage = {
  /**
   * @param {string} key
   * @param {any} [fallback]
   */
  get: getItem,
  /**
   * @param {string} key
   * @param {unknown} value
   */
  set: setItem,
  /**
   * @param {string} key
   */
  remove: removeItem,
  /**
   * @returns {boolean}
   */
  isAvailable() {
    return availableStorage !== null;
  },
};
