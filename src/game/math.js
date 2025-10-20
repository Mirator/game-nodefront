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
