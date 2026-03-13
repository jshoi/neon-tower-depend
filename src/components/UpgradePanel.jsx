import React, { useState } from 'react';
import { UPGRADE_CATEGORIES, calculateUpgradeCost } from '../config/upgradeConfig';

export default function UpgradePanel({ upgrades, money, tower, onUpgrade, onClose }) {
  const [activeCategory, setActiveCategory] = useState('attack');

  const category = UPGRADE_CATEGORIES[activeCategory];

  const getUpgradeLevel = (upgradeId) => upgrades[upgradeId] || 0;

  const getUpgradeCostWithLevel = (upgrade) => {
    const level = getUpgradeLevel(upgrade.id);
    return calculateUpgradeCost({ ...upgrade, currentLevel: level });
  };

  const isMaxLevel = (upgrade) => {
    if (!upgrade.maxLevel) return false;
    return getUpgradeLevel(upgrade.id) >= upgrade.maxLevel;
  };

  const canAfford = (upgrade) => {
    return money >= getUpgradeCostWithLevel(upgrade) && !isMaxLevel(upgrade);
  };

  const getStatDisplay = (upgrade) => {
    const level = getUpgradeLevel(upgrade.id);
    const key = upgrade.statKey;

    if (key === 'coinBonus') {
      return `+${level * upgrade.increment} 코인`;
    }

    const baseVal = tower[key] ?? 0;
    return `${baseVal.toFixed ? baseVal.toFixed(1) : baseVal}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0a0a0f',
          border: '2px solid rgba(0,255,255,0.5)',
          borderRadius: 12,
          padding: 24,
          width: 500,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 0 40px rgba(0,255,255,0.3)',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{
            color: '#00ffff',
            fontFamily: 'monospace',
            fontSize: 20,
            margin: 0,
            textShadow: '0 0 12px #00ffff',
            letterSpacing: 3,
          }}>
            UPGRADE SHOP
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>💰</span>
            <span style={{
              color: '#ffd700',
              fontFamily: 'monospace',
              fontSize: 18,
              fontWeight: 'bold',
              textShadow: '0 0 8px #ffd700',
            }}>
              {money}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'rgba(255,255,255,0.6)',
              width: 28,
              height: 28,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
          >
            ×
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {Object.values(UPGRADE_CATEGORIES).map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                background: activeCategory === cat.id
                  ? 'rgba(0,255,255,0.15)'
                  : 'rgba(255,255,255,0.05)',
                border: `2px solid ${activeCategory === cat.id ? '#00ffff' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 6,
                color: activeCategory === cat.id ? '#00ffff' : 'rgba(255,255,255,0.5)',
                fontFamily: 'monospace',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textShadow: activeCategory === cat.id ? '0 0 8px #00ffff' : 'none',
                boxShadow: activeCategory === cat.id ? '0 0 12px rgba(0,255,255,0.2)' : 'none',
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* 업그레이드 목록 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {category.upgrades.map(upgrade => {
            const level = getUpgradeLevel(upgrade.id);
            const cost = getUpgradeCostWithLevel(upgrade);
            const affordable = canAfford(upgrade);
            const maxed = isMaxLevel(upgrade);

            return (
              <div
                key={upgrade.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: maxed
                    ? 'rgba(255,215,0,0.05)'
                    : affordable
                      ? 'rgba(0,255,255,0.05)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${maxed ? 'rgba(255,215,0,0.4)' : affordable ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8,
                  transition: 'all 0.2s',
                }}
              >
                {/* 업그레이드 정보 */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                    <span style={{
                      color: maxed ? '#ffd700' : affordable ? '#00ffff' : 'rgba(255,255,255,0.5)',
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: 'bold',
                    }}>
                      {upgrade.name}
                    </span>
                    {/* 레벨 표시 */}
                    {level > 0 && (
                      <span style={{
                        background: maxed ? 'rgba(255,215,0,0.2)' : 'rgba(0,255,255,0.2)',
                        color: maxed ? '#ffd700' : '#00ffff',
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontSize: 10,
                        fontFamily: 'monospace',
                      }}>
                        Lv.{level}{upgrade.maxLevel ? `/${upgrade.maxLevel}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{
                    color: 'rgba(200,200,200,0.5)',
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}>
                    {upgrade.description}
                  </div>
                  <div style={{
                    color: 'rgba(200,200,200,0.4)',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    marginTop: 2,
                  }}>
                    현재: {getStatDisplay(upgrade)}
                  </div>
                </div>

                {/* 구매 버튼 */}
                <button
                  onClick={() => !maxed && onUpgrade(upgrade)}
                  disabled={!affordable}
                  style={{
                    background: maxed
                      ? 'rgba(255,215,0,0.1)'
                      : affordable
                        ? 'rgba(0,255,255,0.15)'
                        : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${maxed ? 'rgba(255,215,0,0.5)' : affordable ? '#00ffff' : 'rgba(255,255,255,0.2)'}`,
                    color: maxed ? '#ffd700' : affordable ? '#00ffff' : 'rgba(255,255,255,0.3)',
                    padding: '8px 14px',
                    borderRadius: 6,
                    fontFamily: 'monospace',
                    fontSize: 12,
                    cursor: affordable ? 'pointer' : 'not-allowed',
                    minWidth: 80,
                    textAlign: 'center',
                    textShadow: affordable ? '0 0 6px #00ffff' : 'none',
                    boxShadow: affordable ? '0 0 10px rgba(0,255,255,0.2)' : 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (affordable) {
                      e.currentTarget.style.background = 'rgba(0,255,255,0.25)';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,255,0.4)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (affordable) {
                      e.currentTarget.style.background = 'rgba(0,255,255,0.15)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,255,0.2)';
                    }
                  }}
                >
                  {maxed ? 'MAX' : `💰 ${cost}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
