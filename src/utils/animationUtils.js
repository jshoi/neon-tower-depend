/**
 * 파티클 이펙트 생성 헬퍼
 */
export function createParticles(x, y, color, count = 8) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      size: 2 + Math.random() * 4,
      color,
    });
  }
  return particles;
}

/**
 * 파티클 업데이트
 */
export function updateParticles(particles) {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vx: p.vx * 0.95,
      vy: p.vy * 0.95,
      life: p.life - p.decay,
      size: p.size * 0.97,
    }))
    .filter(p => p.life > 0);
}

/**
 * 파티클 렌더링
 */
export function renderParticles(ctx, particles) {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

/**
 * 코인 텍스트 애니메이션 생성
 */
export function createCoinText(x, y, amount) {
  return {
    x,
    y,
    vy: -1.5,
    life: 1.0,
    decay: 0.02,
    text: `+${amount}`,
    color: '#ffd700',
  };
}

/**
 * 텍스트 애니메이션 업데이트
 */
export function updateTextAnimations(texts) {
  return texts
    .map(t => ({
      ...t,
      y: t.y + t.vy,
      life: t.life - t.decay,
    }))
    .filter(t => t.life > 0);
}

/**
 * 텍스트 애니메이션 렌더링
 */
export function renderTextAnimations(ctx, texts) {
  texts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = t.life;
    ctx.fillStyle = t.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = t.color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });
}

/**
 * 공격 이펙트 생성 (레이저 빔)
 */
export function createAttackEffect(fromX, fromY, toX, toY, color = '#00ffff') {
  return {
    fromX,
    fromY,
    toX,
    toY,
    life: 1.0,
    decay: 0.15,
    color,
  };
}

/**
 * 공격 이펙트 업데이트
 */
export function updateAttackEffects(effects) {
  return effects
    .map(e => ({ ...e, life: e.life - e.decay }))
    .filter(e => e.life > 0);
}

/**
 * 공격 이펙트 렌더링
 */
export function renderAttackEffects(ctx, effects) {
  effects.forEach(e => {
    ctx.save();
    ctx.globalAlpha = e.life * 0.8;
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2 * e.life;
    ctx.shadowBlur = 10;
    ctx.shadowColor = e.color;
    ctx.beginPath();
    ctx.moveTo(e.fromX, e.fromY);
    ctx.lineTo(e.toX, e.toY);
    ctx.stroke();
    ctx.restore();
  });
}
