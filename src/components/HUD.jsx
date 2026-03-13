import React from 'react';
import { WAVE_STATE, getBreakTimeRemaining } from '../game/WaveSystem';

export default function HUD({ tower, waveSystem, money, score, onUpgradeClick, onPauseClick, isPaused }) {
  const healthPercent = Math.max(0, (tower.health / tower.maxHealth) * 100);
  const breakTimeRemaining = getBreakTimeRemaining(waveSystem);

  const getHealthColor = (percent) => {
    if (percent > 60) return '#00ff88';
    if (percent > 30) return '#ffaa00';
    return '#ff3333';
  };

  const getWaveStatusText = () => {
    switch (waveSystem.state) {
      case WAVE_STATE.WAITING:
        return '게임 시작 중...';
      case WAVE_STATE.SPAWNING:
        return `웨이브 ${waveSystem.currentWave} - 적 출현 중`;
      case WAVE_STATE.FIGHTING:
        return `웨이브 ${waveSystem.currentWave} - 전투 중`;
      case WAVE_STATE.BREAK:
        return `웨이브 클리어! 다음 웨이브까지 ${breakTimeRemaining}초`;
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.85)',
        borderBottom: '2px solid rgba(0,255,255,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* 왼쪽: 타워 체력 */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#00ffff', fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold' }}>
            TOWER HP
          </span>
          <span style={{
            color: getHealthColor(healthPercent),
            fontSize: 12,
            fontFamily: 'monospace',
            textShadow: `0 0 8px ${getHealthColor(healthPercent)}`,
          }}>
            {Math.ceil(tower.health)} / {tower.maxHealth}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 4,
          border: '1px solid rgba(0,255,255,0.3)',
          overflow: 'hidden',
        }}>
          <div
            style={{
              width: `${healthPercent}%`,
              height: '100%',
              background: getHealthColor(healthPercent),
              boxShadow: `0 0 8px ${getHealthColor(healthPercent)}`,
              transition: 'width 0.2s, background 0.3s',
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {/* 중앙: 웨이브 정보 */}
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{
          color: '#ff00ff',
          fontSize: 18,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textShadow: '0 0 10px #ff00ff',
          letterSpacing: 2,
        }}>
          WAVE {waveSystem.currentWave}
        </div>
        <div style={{
          color: waveSystem.state === WAVE_STATE.BREAK ? '#ffd700' : 'rgba(200,200,200,0.7)',
          fontSize: 11,
          fontFamily: 'monospace',
          marginTop: 2,
        }}>
          {getWaveStatusText()}
        </div>
      </div>

      {/* 오른쪽: 코인 + 점수 + 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{
              color: '#ffd700',
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              textShadow: '0 0 10px #ffd700',
            }}>
              {money}
            </span>
          </div>
          <div style={{
            color: 'rgba(200,200,200,0.5)',
            fontSize: 10,
            fontFamily: 'monospace',
            textAlign: 'right',
          }}>
            SCORE: {score}
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          style={{
            background: 'transparent',
            border: '2px solid #00ffff',
            color: '#00ffff',
            padding: '6px 12px',
            fontFamily: 'monospace',
            fontSize: 12,
            cursor: 'pointer',
            borderRadius: 4,
            textShadow: '0 0 8px #00ffff',
            boxShadow: '0 0 8px rgba(0,255,255,0.3)',
            letterSpacing: 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(0,255,255,0.15)';
            e.target.style.boxShadow = '0 0 16px rgba(0,255,255,0.6)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'transparent';
            e.target.style.boxShadow = '0 0 8px rgba(0,255,255,0.3)';
          }}
        >
          UPGRADE
        </button>

        <button
          onClick={onPauseClick}
          style={{
            background: 'transparent',
            border: '2px solid rgba(255,255,255,0.4)',
            color: 'rgba(255,255,255,0.7)',
            padding: '6px 10px',
            fontFamily: 'monospace',
            fontSize: 14,
            cursor: 'pointer',
            borderRadius: 4,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.8)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'rgba(255,255,255,0.4)';
            e.target.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>
    </div>
  );
}
