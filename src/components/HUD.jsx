import React from 'react';
import { WAVE_STATE, getBreakTimeRemaining } from '../game/WaveSystem';

export default function HUD({ tower, waveSystem, money, score, onUpgradeClick, onPauseClick, isPaused, hudHeight = 56 }) {
  const healthPercent = Math.max(0, (tower.health / tower.maxHealth) * 100);
  const breakTimeRemaining = getBreakTimeRemaining(waveSystem);

  const getHealthColor = (p) => p > 60 ? '#00ff88' : p > 30 ? '#ffaa00' : '#ff3333';
  const hpColor = getHealthColor(healthPercent);

  const getWaveStatusText = () => {
    switch (waveSystem.state) {
      case WAVE_STATE.WAITING:   return '준비 중...';
      case WAVE_STATE.SPAWNING:  return '적 출현!';
      case WAVE_STATE.FIGHTING:  return '전투 중';
      case WAVE_STATE.BREAK:     return `다음 웨이브 ${breakTimeRemaining}초`;
      default: return '';
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: hudHeight,
      background: 'rgba(0,0,0,0.9)',
      borderBottom: '1px solid rgba(0,255,255,0.35)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: 8,
      zIndex: 10,
      boxSizing: 'border-box',
    }}>

      {/* HP 영역 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ color: '#00ffff', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: 1 }}>HP</span>
          <span style={{ color: hpColor, fontSize: 10, fontFamily: 'monospace', textShadow: `0 0 6px ${hpColor}` }}>
            {Math.ceil(tower.health)}/{tower.maxHealth}
          </span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.2)' }}>
          <div style={{
            width: `${healthPercent}%`, height: '100%',
            background: hpColor, boxShadow: `0 0 6px ${hpColor}`,
            transition: 'width 0.2s, background 0.3s', borderRadius: 3,
          }} />
        </div>
      </div>

      {/* 웨이브 */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{ color: '#ff00ff', fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', textShadow: '0 0 8px #ff00ff', lineHeight: 1 }}>
          W{waveSystem.currentWave}
        </div>
        <div style={{ color: waveSystem.state === WAVE_STATE.BREAK ? '#ffd700' : 'rgba(200,200,200,0.6)', fontSize: 9, fontFamily: 'monospace', marginTop: 2, whiteSpace: 'nowrap' }}>
          {getWaveStatusText()}
        </div>
      </div>

      {/* 코인 */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 13 }}>💰</span>
          <span style={{ color: '#ffd700', fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', textShadow: '0 0 8px #ffd700' }}>
            {money}
          </span>
        </div>
        <div style={{ color: 'rgba(200,200,200,0.4)', fontSize: 9, fontFamily: 'monospace' }}>
          {score}pt
        </div>
      </div>

      {/* UPGRADE 버튼 (터치 타겟 크게) */}
      <button
        onClick={onUpgradeClick}
        style={{
          flexShrink: 0,
          background: 'rgba(0,255,255,0.12)',
          border: '2px solid #00ffff',
          color: '#00ffff',
          padding: '6px 10px',
          fontFamily: 'monospace',
          fontSize: 11,
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: 5,
          textShadow: '0 0 6px #00ffff',
          boxShadow: '0 0 8px rgba(0,255,255,0.25)',
          letterSpacing: 1,
          minWidth: 44,
          minHeight: 36,
          touchAction: 'manipulation',
        }}
      >
        UP
      </button>

      {/* 일시정지 버튼 */}
      <button
        onClick={onPauseClick}
        style={{
          flexShrink: 0,
          background: 'rgba(255,255,255,0.06)',
          border: '2px solid rgba(255,255,255,0.35)',
          color: 'rgba(255,255,255,0.8)',
          padding: '6px 8px',
          fontFamily: 'monospace',
          fontSize: 14,
          cursor: 'pointer',
          borderRadius: 5,
          minWidth: 36,
          minHeight: 36,
          touchAction: 'manipulation',
        }}
      >
        {isPaused ? '▶' : '⏸'}
      </button>
    </div>
  );
}
