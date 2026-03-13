/**
 * 적 렌더링 함수 (Canvas 2D Context 사용)
 */

/**
 * 단일 적 렌더링
 */
export function renderEnemy(ctx, enemy) {
  const { x, y, size, health, maxHealth, slowFactor } = enemy;
  const healthPercent = health / maxHealth;

  // 둔화 상태에 따른 색상
  const isSlow = slowFactor < 0.9;
  const baseColor = isSlow ? '#8844ff' : '#ff0080';
  const glowColor = isSlow ? '#aa66ff' : '#ff0080';

  // 본체 (사각형)
  ctx.save();
  ctx.fillStyle = baseColor;
  ctx.shadowBlur = 15;
  ctx.shadowColor = glowColor;
  ctx.fillRect(x - size, y - size, size * 2, size * 2);
  ctx.restore();

  // 테두리 글로우
  ctx.save();
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = glowColor;
  ctx.strokeRect(x - size, y - size, size * 2, size * 2);
  ctx.restore();

  // 내부 코어 (작은 밝은 사각형)
  ctx.save();
  const coreSize = size * 0.5;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ffffff';
  ctx.fillRect(x - coreSize, y - coreSize, coreSize * 2, coreSize * 2);
  ctx.restore();

  // 체력바
  if (healthPercent < 1) {
    const barWidth = size * 2.4;
    const barHeight = 3;
    const barX = x - barWidth / 2;
    const barY = y - size - 8;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const hpColor = healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3333';
    ctx.fillStyle = hpColor;
    ctx.shadowBlur = 4;
    ctx.shadowColor = hpColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.restore();
  }
}

/**
 * 모든 적 배치 렌더링
 */
export function renderEnemies(ctx, enemies) {
  enemies.forEach(enemy => {
    if (!enemy.isDead) {
      renderEnemy(ctx, enemy);
    }
  });
}
