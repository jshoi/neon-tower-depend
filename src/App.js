import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_CONFIG } from './config/gameConfig';
import {
  createInitialGameState,
  updateGameState,
  purchaseUpgrade,
  restartGame,
  togglePause,
  GAME_STATE,
} from './game/GameManager';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import UpgradePanel from './components/UpgradePanel';
import GameOver from './components/GameOver';

const LOGICAL_W = GAME_CONFIG.canvas.width;   // 800
const LOGICAL_H = GAME_CONFIG.canvas.height;  // 600
const HUD_HEIGHT = 56; // 논리 픽셀 기준 HUD 높이

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialGameState());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [scale, setScale] = useState(1);
  const animFrameRef = useRef(null);
  const containerRef = useRef(null);

  // 브라우저 크기에 맞게 scale 계산
  useEffect(() => {
    function calcScale() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / LOGICAL_W, vh / (LOGICAL_H + HUD_HEIGHT));
      setScale(s);
    }
    calcScale();
    window.addEventListener('resize', calcScale);
    // 모바일 주소창 변화 대응
    window.addEventListener('orientationchange', () => setTimeout(calcScale, 200));
    return () => {
      window.removeEventListener('resize', calcScale);
      window.removeEventListener('orientationchange', calcScale);
    };
  }, []);

  // 게임 루프
  const gameLoop = useCallback((timestamp) => {
    setGameState(prev => {
      if (prev.gameState !== GAME_STATE.PLAYING) return prev;
      return updateGameState(prev, timestamp);
    });
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameLoop]);

  // 터치: 두 손가락 탭 → 일시정지, 한 손가락 탭 → 업그레이드 패널
  useEffect(() => {
    let touchStartCount = 0;
    let touchStartTime = 0;

    const onTouchStart = (e) => {
      touchStartCount = e.touches.length;
      touchStartTime = Date.now();
    };

    const onTouchEnd = (e) => {
      const elapsed = Date.now() - touchStartTime;
      if (elapsed > 300) return; // 롱탭 무시

      if (touchStartCount >= 2) {
        // 두 손가락 탭 → 일시정지
        setGameState(prev => togglePause(prev));
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // PC 키보드 단축키 (있으면 그냥 유지)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowUpgrade(prev => !prev);
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setGameState(prev => togglePause(prev));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleUpgrade = useCallback((upgrade) => {
    setGameState(prev => {
      const { success, newState } = purchaseUpgrade(prev, upgrade);
      return success ? newState : prev;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(restartGame());
    setShowUpgrade(false);
  }, []);

  const handlePause = useCallback(() => {
    setGameState(prev => togglePause(prev));
  }, []);

  const isGameOver = gameState.gameState === GAME_STATE.GAME_OVER;
  const isPaused = gameState.gameState === GAME_STATE.PAUSED;

  const totalH = LOGICAL_H + HUD_HEIGHT;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // 모바일 주소창 안전 영역
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* scale 래퍼 - transform-origin: top center */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: LOGICAL_W,
          height: totalH,
          transformOrigin: 'center center',
          transform: `scale(${scale})`,
          background: '#050508',
          border: '2px solid rgba(0,255,255,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(0,255,255,0.15)',
        }}
      >
        {/* HUD */}
        <HUD
          tower={gameState.tower}
          waveSystem={gameState.waveSystem}
          money={gameState.money}
          score={gameState.score}
          onUpgradeClick={() => setShowUpgrade(true)}
          onPauseClick={handlePause}
          isPaused={isPaused}
          hudHeight={HUD_HEIGHT}
        />

        {/* 캔버스 */}
        <div style={{ position: 'absolute', top: HUD_HEIGHT, left: 0 }}>
          <GameCanvas gameState={gameState} isPaused={isPaused} />
        </div>

        {/* 업그레이드 패널 */}
        {showUpgrade && !isGameOver && (
          <UpgradePanel
            upgrades={gameState.upgrades}
            money={gameState.money}
            tower={gameState.tower}
            onUpgrade={handleUpgrade}
            onClose={() => setShowUpgrade(false)}
          />
        )}

        {/* 게임 오버 */}
        {isGameOver && (
          <GameOver
            score={gameState.score}
            wave={gameState.waveSystem.currentWave}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
