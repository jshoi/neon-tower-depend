/**
 * 타워 렌더링 함수 (Canvas 2D Context 사용)
 */

/**
 * 육각형 그리기
 */
export function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * 타워 본체 렌더링
 */
export function renderTower(ctx, tower) {
  const { x, y, size, health, maxHealth, attackRange, isAttacking } = tower;
  const healthPercent = health / maxHealth;

  // 사거리 표시 (반투명 원)
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, attackRange, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 외부 글로우 (공격 중일 때 더 밝음)
  ctx.save();
  drawHexagon(ctx, x, y, size + 4);
  ctx.strokeStyle = isAttacking
    ? 'rgba(0, 255, 255, 0.8)'
    : 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = isAttacking ? 3 : 1;
  ctx.shadowBlur = isAttacking ? 30 : 15;
  ctx.shadowColor = '#00ffff';
  ctx.stroke();
  ctx.restore();

  // 타워 본체 (채움)
  ctx.save();
  drawHexagon(ctx, x, y, size);

  // 체력에 따른 색상
  const r = Math.floor(255 * (1 - healthPercent));
  const g = Math.floor(200 * healthPercent);
  const fillColor = `rgba(${r}, ${g}, ${Math.floor(50 + 150 * healthPercent)}, 0.4)`;
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffff';
  ctx.stroke();
  ctx.restore();

  // 내부 중심 코어
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = isAttacking ? '#ffffff' : '#00ffff';
  ctx.shadowBlur = isAttacking ? 25 : 12;
  ctx.shadowColor = '#00ffff';
  ctx.fill();
  ctx.restore();

  // 내부 회전 패턴 (데코)
  ctx.save();
  ctx.translate(x, y);
  drawHexagon(ctx, 0, 0, size * 0.55);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 체력바 (타워 아래)
  const barWidth = size * 1.8;
  const barHeight = 5;
  const barX = x - barWidth / 2;
  const barY = y + size + 8;

  ctx.save();
  // 배경
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // 체력
  const hpColor = healthPercent > 0.6 ? '#00ff88' : healthPercent > 0.3 ? '#ffaa00' : '#ff3333';
  ctx.fillStyle = hpColor;
  ctx.shadowBlur = 6;
  ctx.shadowColor = hpColor;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  ctx.restore();
}
