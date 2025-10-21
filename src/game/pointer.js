export function createPointerState() {
  return {
    x: 0,
    y: 0,
    hoverNode: null,
    dragSource: null,
    isDragging: false,
  };
}
