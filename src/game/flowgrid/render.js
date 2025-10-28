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
  ctx.fillStyle = '#f6f3ef';
  ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);

  if (game.aiActionQueue && game.aiActionQueue.length > 0) {
    const now = game.elapsedTime ?? 0;
    ctx.save();
    for (const action of game.aiActionQueue) {
      if (action.type !== 'createLink') continue;
      const source = game.nodes.get(action.sourceId);
      const target = game.nodes.get(action.targetId);
      if (!source || !target) continue;
      const color = FACTION_COLORS[source.owner] ?? FACTION_COLORS.ai;
      const duration = Math.max(action.executeAt - action.createdAt, 0.001);
      const elapsed = clamp((now - action.createdAt) / duration, 0, 1);
      const previewX = source.x + (target.x - source.x) * elapsed;
      const previewY = source.y + (target.y - source.y) * elapsed;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = hexToRgba(color, 0.35);
      ctx.setLineDash([4, 10]);
      ctx.lineDashOffset = 0;
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(previewX, previewY);
      ctx.stroke();

      if (elapsed < 1) {
        ctx.strokeStyle = hexToRgba(color, 0.15);
        ctx.beginPath();
        ctx.moveTo(previewX, previewY);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
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
    const thickness = 2 + (link.establishing ? 0 : normalizedRate * 6);
    ctx.save();
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    if (link.establishing) {
      ctx.strokeStyle = hexToRgba(color, 0.75);
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
      let strokeStyle = '#64748b';
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
        lineWidth = 2 + Math.max(1, amplitude * 0.4);
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
    const outlinePadding = Math.max(4, Math.round(5 * baseScale));
    const ringOffset = Math.max(1, Math.round(2 * baseScale));
    const innerInset = Math.max(3, Math.round(4 * baseScale));
    const energyInset = Math.max(innerInset + 2, Math.round(node.radius * 0.45));
    const ringLineWidth = Math.max(4, Math.round(node.radius * 0.22));
    const energyLineWidth = Math.max(ringLineWidth + 1, Math.round(node.radius * 0.28));
    const hoverRingLineWidth = ringLineWidth + 1;
    const hoverEnergyLineWidth = energyLineWidth + 1;

    const outerRadius = node.radius + outlinePadding;
    const ringRadius = node.radius + ringOffset;
    const innerFillRadius = Math.max(2, node.radius - innerInset);
    const energyRadius = Math.max(node.radius - energyInset, node.radius * 0.58);
    const energyRatio = clamp(node.energy / node.capacity, 0, 1);

    if (flashRatio > 0) {
      const pulse = 0.5 + Math.sin((game.elapsedTime ?? 0) * 18) * 0.5;
      const glowStrength = flashRatio * pulse;
      ctx.save();
      ctx.strokeStyle = hexToRgba('#f97316', 0.35 + 0.45 * glowStrength);
      ctx.lineWidth = Math.max(ringLineWidth + 3, Math.round(ringLineWidth * (1.25 + glowStrength * 0.6)));
      ctx.shadowColor = hexToRgba('#f97316', 0.6 * flashRatio);
      ctx.shadowBlur = 12 * flashRatio;
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringRadius + outlinePadding * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = '#f6f3ef';
    ctx.beginPath();
    ctx.arc(node.x, node.y, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    const ringAlpha = hover ? 0.9 : 0.75;
    const flashBoost = flashRatio > 0 ? 0.2 * flashRatio : 0;
    ctx.strokeStyle = hexToRgba(color, Math.min(1, ringAlpha + flashBoost));
    ctx.lineWidth = hover ? hoverRingLineWidth : ringLineWidth;
    ctx.beginPath();
    ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f6f3ef';
    ctx.beginPath();
    ctx.arc(node.x, node.y, innerFillRadius, 0, Math.PI * 2);
    ctx.fill();

    const energyBaseAlpha = 0.25 + flashBoost * 0.5;
    ctx.strokeStyle = hexToRgba(color, energyBaseAlpha);
    ctx.lineWidth = hover ? hoverEnergyLineWidth : energyLineWidth;
    ctx.beginPath();
    ctx.arc(node.x, node.y, energyRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = hover ? hoverEnergyLineWidth : energyLineWidth;
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

    const fontSize = Math.round(clamp(node.radius * 0.9, 13, 28));
    const strokeWidth = Math.max(2, Math.round(fontSize * 0.18));
    ctx.font = `700 ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeText(String(Math.round(node.energy)), node.x, node.y);
    ctx.fillStyle = '#0f172a';
    ctx.fillText(String(Math.round(node.energy)), node.x, node.y);

    ctx.restore();
  }
}
