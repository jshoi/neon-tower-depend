import React, { useEffect, useState } from 'react';

export default function GameOver({ score, wave, onRestart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform 0.5s',
        }}
      >
        {/* GAME OVER 타이틀 */}
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 56,
            fontWeight: 'bold',
            color: '#ff0033',
            textShadow: '0 0 20px #ff0033, 0 0 40px #ff0033, 0 0 80px rgba(255,0,51,0.5)',
            letterSpacing: 8,
            marginBottom: 8,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          GAME OVER
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            color: 'rgba(255,100,100,0.7)',
            letterSpacing: 4,
            marginBottom: 40,
          }}
        >
          TOWER DESTROYED
        </div>

        {/* 통계 */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            marginBottom: 48,
          }}
        >
          <StatBox label="웨이브" value={wave} color="#ff00ff" />
          <StatBox label="총 점수" value={score} color="#ffd700" />
        </div>

        {/* 재시작 버튼 */}
        <button
          onClick={onRestart}
          style={{
            background: 'transparent',
            border: '3px solid #00ffff',
            color: '#00ffff',
            padding: '14px 48px',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: 8,
            letterSpacing: 4,
            textShadow: '0 0 12px #00ffff',
            boxShadow: '0 0 20px rgba(0,255,255,0.4)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,255,255,0.15)';
            e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,255,0.7)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,255,0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          RESTART
        </button>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div
      style={{
        background: `rgba(${color === '#ffd700' ? '255,215,0' : color === '#ff00ff' ? '255,0,255' : '0,255,255'}, 0.08)`,
        border: `2px solid ${color}`,
        borderRadius: 10,
        padding: '16px 32px',
        boxShadow: `0 0 16px ${color}44`,
      }}
    >
      <div style={{
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 3,
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        color,
        fontFamily: 'monospace',
        fontSize: 36,
        fontWeight: 'bold',
        textShadow: `0 0 12px ${color}`,
      }}>
        {value}
      </div>
    </div>
  );
}
