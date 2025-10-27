export function distance(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.hypot(dx, dy);
}

export function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return distance(px, py, ax, ay);
  }
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const clampedT = clamp(t, 0, 1);
  const closestX = ax + clampedT * dx;
  const closestY = ay + clampedT * dy;
  return distance(px, py, closestX, closestY);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes any numeric seed into an unsigned 32-bit integer value.
 *
 * @param {number} seed
 */
export function normalizeSeed(seed) {
  if (!Number.isFinite(seed)) {
    return 0;
  }
  return Math.floor(seed) >>> 0;
}

/**
 * Creates a deterministic pseudo random number generator.
 * Implementation based on the mulberry32 algorithm.
 *
 * @param {number} seed
 */
export function createSeededRng(seed) {
  let state = normalizeSeed(seed);

  return {
    /**
     * Returns the next pseudo random value in the [0, 1) range.
     */
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}
