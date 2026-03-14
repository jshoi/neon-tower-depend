/**
 * 적 렌더링 (유형별 모양/색상/이펙트)
 */

const TYPE_STYLES = {
  BASIC: {
    fill: '#FFFFFF',
    stroke: '#00FFFF',
    strokeWidth: 1.5,
    shadowColor: '#00FFFF',
    shadowBlur: 12,
  },
  SPEEDER: {
    fill: '#FFD700',
    stroke: '#FF8C00',
    strokeWidth: 1.5,
    shadowColor: '#FFD700',
    shadowBlur: 14,
  },
  TANK: {
    fill: '#6080A0',
    stroke: '#4169E1',
    strokeWidth: 3,
    shadowColor: '#4169E1',
    shadowBlur: 10,
  },
  SPLITTER: {
    fill: '#9B59B6',
    stroke: '#FF00FF',
    strokeWidth: 2,
    shadowColor: '#FF00FF',
    shadowBlur: 14,
  },
  REGEN: {
    fill: '#2ECC71',
    stroke: '#ADFF2F',
    strokeWidth: 2,
    shadowColor: '#2ECC71',
    shadowBlur: 12,
  },
  GHOST: {
    fill: '#87CEEB',
    stroke: '#00FFFF',
    strokeWidth: 1,
    shadowColor: '#00FFFF',
    shadowBlur: 20,
  },
  BOSS: {
    fill: '#FF0000',
    stroke: '#FF6600',
    strokeWidth: 2.5,
    shadowColor: '#FF4400',
    shadowBlur: 20,
  },
};

// ─── 도형 그리기 함수들 ───

function drawSquare(ctx, x, y, size) {
  ctx.fillRect(x - size, y - size, size * 2, size * 2);
}

function drawDiamond(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();
}

function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawOctagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCircle(ctx, x, y, size) {
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawStar(ctx, x, y, size, phase) {
  const outerR = size;
  const innerR = size * 0.42;
  const points = 5;
  // 펄싱 글로우
  ctx.shadowBlur = 15 + 8 * Math.sin(phase);
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function strokeShape(ctx, x, y, size, type, strokeWidth) {
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  switch (type) {
    case 'BASIC':
      ctx.rect(x - size, y - size, size * 2, size * 2);
      break;
    case 'SPEEDER':
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      break;
    case 'TANK':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'SPLITTER':
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'REGEN':
    case 'GHOST':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
    case 'BOSS': {
      const outerR = size;
      const innerR = size * 0.42;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    default:
      ctx.rect(x - size, y - size, size * 2, size * 2);
  }
  ctx.stroke();
}

// ─── 메인 렌더링 ───

export function renderEnemy(ctx, enemy) {
  const { x, y, size, health, maxHealth, type, glowPhase, isFrozen, isInvincible } = enemy;
  const healthPercent = health / maxHealth;
  const style = TYPE_STYLES[type] || TYPE_STYLES.BASIC;

  // SPEEDER trail
  if (type === 'SPEEDER' && enemy.trail && enemy.trail.length > 0) {
    enemy.trail.forEach((pos, i) => {
      ctx.save();
      ctx.globalAlpha = 0.12 - i * 0.02;
      ctx.fillStyle = style.fill;
      ctx.fillRect(pos.x - size * 0.7, pos.y - size * 0.7, size * 1.4, size * 1.4);
      ctx.restore();
    });
  }

  ctx.save();

  // 빙결: 파란 틴트
  if (isFrozen) {
    ctx.filter = 'hue-rotate(180deg) saturate(2)';
  }

  // GHOST: 반투명 + 명멸
  if (type === 'GHOST') {
    ctx.globalAlpha = (isInvincible ? 0.2 : 0.55) + 0.15 * Math.sin(glowPhase * 2);
  }

  // 그림자/글로우
  ctx.shadowBlur = style.shadowBlur;
  ctx.shadowColor = style.shadowColor;

  // BOSS 분노 시 빨강 강화
  if (type === 'BOSS' && enemy.enraged) {
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#FF0000';
  }

  ctx.fillStyle = style.fill;

  // 본체 그리기
  switch (type) {
    case 'BASIC':    drawSquare  (ctx, x, y, size); break;
    case 'SPEEDER':  drawDiamond (ctx, x, y, size); break;
    case 'TANK':     drawHexagon (ctx, x, y, size); break;
    case 'SPLITTER': drawOctagon (ctx, x, y, size); break;
    case 'REGEN':    drawCircle  (ctx, x, y, size); break;
    case 'GHOST':    drawCircle  (ctx, x, y, size); break;
    case 'BOSS':     drawStar    (ctx, x, y, size, glowPhase); break;
    default:         drawSquare  (ctx, x, y, size);
  }

  // 테두리
  ctx.strokeStyle = style.stroke;
  ctx.shadowBlur = style.shadowBlur * 0.6;
  strokeShape(ctx, x, y, size, type, style.strokeWidth);

  ctx.restore();

  // SPLITTER HP 50% 이하 깜빡임
  if (type === 'SPLITTER' && healthPercent <= 0.5) {
    const blinkAlpha = 0.5 + 0.5 * Math.sin(glowPhase * 6);
    ctx.save();
    ctx.globalAlpha = blinkAlpha;
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FF00FF';
    strokeShape(ctx, x, y, size + 3, type, 2);
    ctx.restore();
  }

  // REGEN 재생 중 회전 입자
  if (type === 'REGEN' && health < maxHealth) {
    for (let i = 0; i < 3; i++) {
      const angle = glowPhase + (Math.PI * 2 * i) / 3;
      const px = x + (size + 5) * Math.cos(angle);
      const py = y + (size + 5) * Math.sin(angle);
      ctx.save();
      ctx.fillStyle = '#ADFF2F';
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#ADFF2F';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 체력바
  if (healthPercent < 1) {
    const barWidth = size * 2.8;
    const barHeight = 3;
    const barX = x - barWidth / 2;
    const barY = y - size - 8;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // REGEN: 초록 HP바
    const hpColor = type === 'REGEN'
      ? '#2ECC71'
      : healthPercent > 0.5 ? '#00ff88' : healthPercent > 0.25 ? '#ffaa00' : '#ff3333';
    ctx.fillStyle = hpColor;
    ctx.shadowBlur = 4;
    ctx.shadowColor = hpColor;
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.restore();
  }

  // 빙결 오버레이
  if (isFrozen) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#88CCFF';
    ctx.strokeStyle = '#AADDFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, size + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 독 오버레이 (초록 틴트)
  if (enemy.poisoned) {
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#00FF44';
    ctx.beginPath();
    ctx.arc(x, y, size + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function renderEnemies(ctx, enemies) {
  enemies.forEach(enemy => {
    if (!enemy.isDead) renderEnemy(ctx, enemy);
  });
}
