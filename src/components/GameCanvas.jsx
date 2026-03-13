import React, { useRef, useEffect, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { renderTower } from './Tower';
import { renderEnemies } from './Enemy';
import { renderParticles, renderTextAnimations, renderAttackEffects } from '../utils/animationUtils';

/**
 * 배경 그리드 그리기 (네온 스타일)
 */
function drawBackground(ctx, width, height) {
  // 순수 검정 배경
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, width, height);

  // 그리드 라인
  const gridSize = 40;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 코너 장식
  const cornerSize = 20;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
  ctx.lineWidth = 2;

  // 왼쪽 위
  ctx.beginPath(); ctx.moveTo(8, 8 + cornerSize); ctx.lineTo(8, 8); ctx.lineTo(8 + cornerSize, 8); ctx.stroke();
  // 오른쪽 위
  ctx.beginPath(); ctx.moveTo(width - 8 - cornerSize, 8); ctx.lineTo(width - 8, 8); ctx.lineTo(width - 8, 8 + cornerSize); ctx.stroke();
  // 왼쪽 아래
  ctx.beginPath(); ctx.moveTo(8, height - 8 - cornerSize); ctx.lineTo(8, height - 8); ctx.lineTo(8 + cornerSize, height - 8); ctx.stroke();
  // 오른쪽 아래
  ctx.beginPath(); ctx.moveTo(width - 8 - cornerSize, height - 8); ctx.lineTo(width - 8, height - 8); ctx.lineTo(width - 8, height - 8 - cornerSize); ctx.stroke();
  ctx.restore();
}

/**
 * 일시정지 오버레이
 */
function drawPauseOverlay(ctx, width, height) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#00ffff';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', width / 2, height / 2);
  ctx.restore();
}

export default function GameCanvas({ gameState, isPaused }) {
  const canvasRef = useRef(null);
  const { width, height } = GAME_CONFIG.canvas;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // 배경
    drawBackground(ctx, width, height);

    // 공격 이펙트 (타워 공격 레이저)
    renderAttackEffects(ctx, gameState.attackEffects || []);

    // 적 렌더링
    renderEnemies(ctx, gameState.enemies || []);

    // 타워 렌더링
    if (gameState.tower) {
      renderTower(ctx, gameState.tower);
    }

    // 파티클 이펙트
    renderParticles(ctx, gameState.particles || []);

    // 텍스트 애니메이션 (코인)
    renderTextAnimations(ctx, gameState.textAnimations || []);

    // 일시정지 오버레이
    if (isPaused) {
      drawPauseOverlay(ctx, width, height);
    }
  }, [gameState, isPaused, width, height]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        display: 'block',
        imageRendering: 'crisp-edges',
      }}
    />
  );
}
