/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

import { hexToRgba } from '../color.js';
import { FACTION_COLORS, LINK_BUILD_DASH_PATTERN, LINK_DASH_PATTERN } from '../constants.js';
import { clamp } from '../math.js';

/**
 * @param {FlowgridGame} game
 */
export function render(game) {
  const ctx = game.ctx;
  const pointer = game.pointer;
  ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
  ctx.fillStyle = '#f3f1ec';
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  if (game.aiControllers && game.aiControllers.size > 0) {
    const now = game.elapsedTime ?? 0;
    ctx.save();
    for (const controller of game.aiControllers.values()) {
      for (const action of controller.actionQueue) {
        if (action.type !== 'createLink') continue;
        const source = game.nodes.get(action.sourceId);
        const target = game.nodes.get(action.targetId);
        if (!source || !target) continue;
        const color = FACTION_COLORS[source.owner] ?? FACTION_COLORS['ai-red'];
        const duration = Math.max(action.executeAt - action.createdAt, 0.001);
        const elapsed = clamp((now - action.createdAt) / duration, 0, 1);
        const previewX = source.x + (target.x - source.x) * elapsed;
        const previewY = source.y + (target.y - source.y) * elapsed;

        ctx.lineWidth = 3;
        ctx.strokeStyle = hexToRgba(color, 0.4);
        ctx.setLineDash([4, 10]);
        ctx.lineDashOffset = 0;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(previewX, previewY);
        ctx.stroke();

        if (elapsed < 1) {
          ctx.strokeStyle = hexToRgba(color, 0.18);
          ctx.beginPath();
          ctx.moveTo(previewX, previewY);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  for (const link of game.links.values()) {
    const source = game.nodes.get(link.sourceId);
    const target = game.nodes.get(link.targetId);
    if (!source || !target) continue;
    const color = FACTION_COLORS[link.owner];
    const ratio = link.length > 0 ? clamp(link.buildProgress / link.length, 0, 1) : 1;
    const endX = source.x + (target.x - source.x) * ratio;
    const endY = source.y + (target.y - source.y) * ratio;
    const normalizedRate = link.maxRate > 0 ? clamp(link.smoothedRate / link.maxRate, 0, 1) : 0;
    const thickness = 6 + (link.establishing ? 0 : normalizedRate * 4);
    ctx.save();
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    if (link.establishing) {
      ctx.strokeStyle = hexToRgba(color, 0.6);
      ctx.setLineDash(LINK_BUILD_DASH_PATTERN);
      ctx.lineDashOffset = 0;
    } else {
      ctx.strokeStyle = color;
      ctx.setLineDash(LINK_DASH_PATTERN);
      ctx.lineDashOffset = link.dashOffset;
    }
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    if (link.establishing && ratio < 1) {
      ctx.strokeStyle = hexToRgba(color, 0.25);
      ctx.setLineDash([3, 10]);
      ctx.lineDashOffset = 0;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  const pointerShakeRatio =
    pointer.shakeDuration > 0 ? clamp(pointer.shakeTimer / pointer.shakeDuration, 0, 1) : 0;
  const pointerShakeSource = pointer.shakeSourceId
    ? game.nodes.get(pointer.shakeSourceId)
    : null;
  const showShakeLine = pointerShakeRatio > 0 && pointerShakeSource;

  if ((pointer.isDragging && pointer.dragSource) || showShakeLine) {
    const originNode = pointer.isDragging && pointer.dragSource ? pointer.dragSource : pointerShakeSource;
    if (originNode) {
      const time = game.elapsedTime ?? 0;
      let strokeStyle = '#94a3b8';
      let lineWidth = 2;
      let dash = [6, 6];
      let dashOffset = 0;
      let pointerX = pointer.isDragging ? pointer.x : pointer.shakeTargetX;
      let pointerY = pointer.isDragging ? pointer.y : pointer.shakeTargetY;
      const shouldShake =
        pointerShakeRatio > 0 && (!pointer.isDragging || pointer.dragSource?.id === pointer.shakeSourceId);

      if (shouldShake) {
        const amplitude = pointer.shakeMagnitude * pointerShakeRatio;
        pointerX += Math.sin(time * 80) * amplitude;
        pointerY += Math.cos(time * 90) * amplitude;
        strokeStyle = '#ef4444';
        lineWidth = 3 + Math.max(0.5, amplitude * 0.35);
        dash = [4, 8];
        dashOffset = Math.sin(time * 160) * 6 * pointerShakeRatio;
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(dash);
      ctx.lineDashOffset = dashOffset;
      ctx.beginPath();
      ctx.moveTo(originNode.x, originNode.y);
      ctx.lineTo(pointerX, pointerY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;
    }
  }

  for (const node of game.nodes.values()) {
    const color = FACTION_COLORS[node.owner];
    ctx.save();

    const hover = game.pointer.hoverNode?.id === node.id;
    const flashRatio =
      node.flashDuration > 0 ? clamp(node.flashTimer / node.flashDuration, 0, 1) : 0;
    const baseScale = node.radius / 23;
    const ringLineWidth = Math.max(5, Math.round(node.radius * 0.32));
    const hoverRingLineWidth = ringLineWidth + 2;
    const ringRadius = Math.max(6, node.radius - ringLineWidth * 0.5);
    const innerFillRadius = Math.max(2, ringRadius - ringLineWidth * 0.65);
    const energyRadius = ringRadius;
    const energyRatio = clamp(node.energy / node.capacity, 0, 1);

    if (flashRatio > 0) {
      const pulse = 0.6 + Math.sin((game.elapsedTime ?? 0) * 18) * 0.4;
      const haloRadius = ringRadius + ringLineWidth;
      ctx.save();
      ctx.strokeStyle = hexToRgba(color, 0.25 + flashRatio * 0.35);
      ctx.lineWidth = ringLineWidth * (1.1 + pulse * 0.15 * flashRatio);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(node.x, node.y, haloRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#fdfbf5';
    ctx.beginPath();
    ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
    ctx.fill();

    const ringAlpha = 0.28 + flashRatio * 0.25 + (hover ? 0.14 : 0);
    ctx.strokeStyle = hexToRgba(color, ringAlpha);
    ctx.lineWidth = hover ? hoverRingLineWidth : ringLineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(node.x, node.y, energyRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = hover ? hoverRingLineWidth : ringLineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(
      node.x,
      node.y,
      energyRadius,
      -Math.PI / 2,
      -Math.PI / 2 + energyRatio * Math.PI * 2,
    );
    ctx.stroke();

    ctx.fillStyle = '#f3f1ec';
    ctx.beginPath();
    ctx.arc(node.x, node.y, innerFillRadius, 0, Math.PI * 2);
    ctx.fill();

    const centerMarkRadius = Math.max(3, innerFillRadius - Math.max(1, Math.round(baseScale * 4)));
    if (centerMarkRadius > 2) {
      ctx.fillStyle = hexToRgba(color, 0.18 + (hover ? 0.12 : 0));
      ctx.beginPath();
      ctx.arc(node.x, node.y, centerMarkRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const fontSize = Math.round(clamp(node.radius * 0.72, 10, 22));
    ctx.font = `600 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1f2933';
    ctx.fillText(String(Math.round(node.energy)), node.x, node.y);

    ctx.restore();
  }
}
