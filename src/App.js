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

const { width, height } = GAME_CONFIG.canvas;
const HUD_HEIGHT = 60;

export default function App() {
  const [gameState, setGameState] = useState(() => createInitialGameState());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const animFrameRef = useRef(null);

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
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameLoop]);

  // 키보드 단축키
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowUpgrade(prev => !prev);
      }
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

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width,
          height: height + HUD_HEIGHT,
          background: '#050508',
          border: '2px solid rgba(0,255,255,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(0,255,255,0.15), inset 0 0 60px rgba(0,0,50,0.5)',
        }}
      >
        {/* HUD */}
        <div style={{ height: HUD_HEIGHT }}>
          <HUD
            tower={gameState.tower}
            waveSystem={gameState.waveSystem}
            money={gameState.money}
            score={gameState.score}
            onUpgradeClick={() => setShowUpgrade(true)}
            onPauseClick={handlePause}
            isPaused={isPaused}
          />
        </div>

        {/* 게임 캔버스 */}
        <div style={{ position: 'relative' }}>
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

        {/* 게임 오버 화면 */}
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
