export function createPointerState() {
  return {
    x: 0,
    y: 0,
    hoverNode: null,
    dragSource: null,
    isDragging: false,
    shakeTimer: 0,
    shakeDuration: 0,
    shakeMagnitude: 0,
    shakeSourceId: null,
    shakeTargetX: 0,
    shakeTargetY: 0,
  };
}
