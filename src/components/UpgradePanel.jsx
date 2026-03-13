import React, { useState } from 'react';
import { UPGRADE_CATEGORIES, calculateUpgradeCost } from '../config/upgradeConfig';

export default function UpgradePanel({ upgrades, money, tower, onUpgrade, onClose }) {
  const [activeCategory, setActiveCategory] = useState('attack');
  const category = UPGRADE_CATEGORIES[activeCategory];

  const getLevel = (id) => upgrades[id] || 0;
  const getCost = (u) => calculateUpgradeCost({ ...u, currentLevel: getLevel(u.id) });
  const isMaxed = (u) => u.maxLevel ? getLevel(u.id) >= u.maxLevel : false;
  const canAfford = (u) => money >= getCost(u) && !isMaxed(u);

  const getStatDisplay = (u) => {
    if (u.statKey === 'coinBonus') return `+${getLevel(u.id) * u.increment}`;
    const v = tower[u.statKey] ?? 0;
    return typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(1) : String(v);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          background: '#080810',
          margin: 12,
          borderRadius: 12,
          border: '2px solid rgba(0,255,255,0.4)',
          boxShadow: '0 0 30px rgba(0,255,255,0.2)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(0,255,255,0.2)',
          flexShrink: 0,
        }}>
          <span style={{ color: '#00ffff', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', textShadow: '0 0 10px #00ffff', letterSpacing: 2 }}>
            UPGRADE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13 }}>💰</span>
            <span style={{ color: '#ffd700', fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', textShadow: '0 0 8px #ffd700' }}>
              {money}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.7)',
              width: 36, height: 36,
              borderRadius: 6, cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              touchAction: 'manipulation',
            }}
          >
            ×
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px', flexShrink: 0 }}>
          {Object.values(UPGRADE_CATEGORIES).map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flex: 1, padding: '9px 0',
                background: activeCategory === cat.id ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${activeCategory === cat.id ? '#00ffff' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: 7,
                color: activeCategory === cat.id ? '#00ffff' : 'rgba(255,255,255,0.45)',
                fontFamily: 'monospace', fontSize: 12,
                cursor: 'pointer',
                textShadow: activeCategory === cat.id ? '0 0 6px #00ffff' : 'none',
                touchAction: 'manipulation',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* 업그레이드 목록 - 스크롤 가능 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {category.upgrades.map(u => {
            const level = getLevel(u.id);
            const cost = getCost(u);
            const affordable = canAfford(u);
            const maxed = isMaxed(u);

            return (
              <div
                key={u.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 12px',
                  background: maxed ? 'rgba(255,215,0,0.05)' : affordable ? 'rgba(0,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${maxed ? 'rgba(255,215,0,0.35)' : affordable ? 'rgba(0,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 8,
                }}
              >
                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{
                      color: maxed ? '#ffd700' : affordable ? '#00ffff' : 'rgba(255,255,255,0.45)',
                      fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold',
                    }}>
                      {u.name}
                    </span>
                    {level > 0 && (
                      <span style={{
                        background: maxed ? 'rgba(255,215,0,0.15)' : 'rgba(0,255,255,0.15)',
                        color: maxed ? '#ffd700' : '#00ffff',
                        padding: '1px 5px', borderRadius: 3, fontSize: 9, fontFamily: 'monospace',
                      }}>
                        Lv{level}{u.maxLevel ? `/${u.maxLevel}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(200,200,200,0.45)', fontSize: 10, fontFamily: 'monospace' }}>
                    {u.description}
                  </div>
                  <div style={{ color: 'rgba(180,180,180,0.35)', fontSize: 9, fontFamily: 'monospace', marginTop: 1 }}>
                    현재: {getStatDisplay(u)}
                  </div>
                </div>

                {/* 구매 버튼 - 터치 타겟 크게 */}
                <button
                  onClick={() => !maxed && affordable && onUpgrade(u)}
                  style={{
                    flexShrink: 0,
                    background: maxed ? 'rgba(255,215,0,0.1)' : affordable ? 'rgba(0,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${maxed ? 'rgba(255,215,0,0.45)' : affordable ? '#00ffff' : 'rgba(255,255,255,0.15)'}`,
                    color: maxed ? '#ffd700' : affordable ? '#00ffff' : 'rgba(255,255,255,0.25)',
                    padding: '0 10px',
                    height: 44,
                    borderRadius: 7,
                    fontFamily: 'monospace', fontSize: 11,
                    cursor: affordable ? 'pointer' : 'default',
                    minWidth: 68,
                    textAlign: 'center',
                    textShadow: affordable ? '0 0 5px #00ffff' : 'none',
                    touchAction: 'manipulation',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {maxed ? (
                    <span>MAX</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 10 }}>💰</span>
                      <span>{cost}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
