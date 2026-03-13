import React from 'react';

/**
 * 코인 텍스트 애니메이션 컴포넌트
 * Canvas 외부에서 React DOM으로 오버레이 렌더링
 */
export default function CoinAnimation({ animations }) {
  if (!animations || animations.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {animations.map((anim, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: anim.x,
            top: anim.y,
            transform: 'translate(-50%, -50%)',
            color: anim.color || '#ffd700',
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 'bold',
            opacity: anim.life,
            textShadow: `0 0 10px ${anim.color || '#ffd700'}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {anim.text}
        </div>
      ))}
    </div>
  );
}
