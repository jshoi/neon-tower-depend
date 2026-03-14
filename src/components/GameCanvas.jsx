import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { renderTower } from './Tower';
import { renderEnemies } from './Enemy';
import { renderParticles, renderTextAnimations, renderAttackEffects } from '../utils/animationUtils';

const { width, height } = GAME_CONFIG.canvas;

function drawBackground(ctx, w, h) {
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, w, h);

  const gridSize = 40;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();

  const cs = 20;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(8, 8 + cs); ctx.lineTo(8, 8); ctx.lineTo(8 + cs, 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 8 - cs, 8); ctx.lineTo(w - 8, 8); ctx.lineTo(w - 8, 8 + cs); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, h - 8 - cs); ctx.lineTo(8, h - 8); ctx.lineTo(8 + cs, h - 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w - 8 - cs, h - 8); ctx.lineTo(w - 8, h - 8); ctx.lineTo(w - 8, h - 8 - cs); ctx.stroke();
  ctx.restore();
}

function drawPauseOverlay(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#00ffff';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', w / 2, h / 2 - 16);
  ctx.font = '16px monospace';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(0,255,255,0.6)';
  ctx.fillText('⏸ 버튼을 눌러 재개', w / 2, h / 2 + 24);
  ctx.restore();
}

function drawNewTypeNotice(ctx, notice, w, h) {
  if (!notice) return;
  ctx.save();
  const boxW = 230, boxH = 52;
  const bx = (w - boxW) / 2;
  const by = h - 90;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#ff00ff';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('NEW: ' + notice.label, w / 2, by + 8);

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = '9px monospace';
  ctx.fillText(notice.desc, w / 2, by + 28);
  ctx.restore();
}

export default function GameCanvas({ gameState, isPaused }) {
  const canvasRef = useRef(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);
    renderAttackEffects(ctx, gameState.attackEffects || []);
    renderEnemies(ctx, gameState.enemies || []);
    if (gameState.tower) renderTower(ctx, gameState.tower);
    renderParticles(ctx, gameState.particles || []);
    renderTextAnimations(ctx, gameState.textAnimations || []);

    // 신규 적 유형 등장 알림
    const notice = gameState.waveSystem?.newTypeNotice;
    if (notice && gameState.waveSystem?.noticeTimer > 0) {
      drawNewTypeNotice(ctx, notice, width, height);
    }

    if (isPaused) drawPauseOverlay(ctx, width, height);
  }, [gameState, isPaused]);

  useEffect(() => { render(); }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block' }}
    />
  );
}
