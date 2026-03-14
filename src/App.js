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
const HUD_HEIGHT = 56;

// 초기 scale을 즉시 계산 (useState(1) 대신 사용해서 첫 렌더부터 올바른 크기)
function calcScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Math.min(vw / LOGICAL_W, vh / (LOGICAL_H + HUD_HEIGHT));
}

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialGameState());
  const [showUpgrade, setShowUpgrade] = useState(false);
  // 초기값을 즉시 계산된 값으로 설정
  const [scale, setScale] = useState(() => calcScale());
  const animFrameRef = useRef(null);

  // 리사이즈 대응
  useEffect(() => {
    function handleResize() {
      setScale(calcScale());
    }
    window.addEventListener('resize', handleResize);
    const onOrient = () => setTimeout(handleResize, 200);
    window.addEventListener('orientationchange', onOrient);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', onOrient);
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

  // PC 키보드 단축키
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
        height: '100dvh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
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
          // 레이아웃이 scale 이전 크기를 차지하지 않도록
          flexShrink: 0,
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
            currentWave={gameState.waveSystem.currentWave}
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
