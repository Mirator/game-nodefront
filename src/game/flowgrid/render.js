/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

import { hexToRgba } from '../color.js';
import {
  FACTION_COLORS,
  FRIENDLY_OUTLINE,
  LINK_BUILD_DASH_PATTERN,
  LINK_DASH_PATTERN,
} from '../constants.js';
import { clamp } from '../math.js';

/**
 * @param {FlowgridGame} game
 */
export function render(game) {
  const ctx = game.ctx;
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

  if (game.pointer.isDragging && game.pointer.dragSource) {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = 0;
    ctx.beginPath();
    ctx.moveTo(game.pointer.dragSource.x, game.pointer.dragSource.y);
    ctx.lineTo(game.pointer.x, game.pointer.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }

  for (const node of game.nodes.values()) {
    const color = FACTION_COLORS[node.owner];
    ctx.save();

    ctx.shadowColor = hexToRgba(color, 0.45);
    ctx.shadowBlur = node.radius * 1.6;
    ctx.fillStyle = '#f1ece6';
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0;

    ctx.strokeStyle = node.owner === 'player' ? FRIENDLY_OUTLINE : '#1f2933';
    ctx.lineWidth = game.pointer.hoverNode?.id === node.id ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 1, 0, Math.PI * 2);
    ctx.stroke();

    const bodyGradient = ctx.createRadialGradient(
      node.x,
      node.y,
      Math.max(2, node.radius * 0.2),
      node.x,
      node.y,
      node.radius,
    );
    bodyGradient.addColorStop(0, 'rgba(255,255,255,0.85)');
    bodyGradient.addColorStop(0.7, hexToRgba(color, 0.95));
    bodyGradient.addColorStop(1, color);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();

    const energyRatio = clamp(node.energy / node.capacity, 0, 1);
    const innerRadius = node.radius - 4;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(node.x, node.y, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.arc(node.x, node.y, innerRadius, -Math.PI / 2, -Math.PI / 2 + energyRatio * Math.PI * 2);
    ctx.lineTo(node.x, node.y);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#1f2933';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.round(node.energy)), node.x, node.y);

    ctx.restore();
  }
}
