/** @typedef {import('../FlowgridGame.js').FlowgridGame} FlowgridGame */

import { hexToRgba } from '../color.js';
import { FACTION_COLORS, LINK_BUILD_DASH_PATTERN, LINK_DASH_PATTERN } from '../constants.js';
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

    const hover = game.pointer.hoverNode?.id === node.id;
    const outerRadius = node.radius + 4;
    const ringRadius = node.radius + 1;
    const energyRadius = Math.max(node.radius - 5, node.radius * 0.65);
    const energyRatio = clamp(node.energy / node.capacity, 0, 1);

    ctx.fillStyle = '#f6f3ef';
    ctx.beginPath();
    ctx.arc(node.x, node.y, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(color, hover ? 0.9 : 0.75);
    ctx.lineWidth = hover ? 5 : 4;
    ctx.beginPath();
    ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f6f3ef';
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(color, 0.25);
    ctx.lineWidth = hover ? 6 : 5;
    ctx.beginPath();
    ctx.arc(node.x, node.y, energyRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = hover ? 6 : 5;
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

    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.round(node.energy)), node.x, node.y);

    ctx.restore();
  }
}
