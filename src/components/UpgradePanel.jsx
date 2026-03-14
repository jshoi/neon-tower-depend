import React, { useState } from 'react';
import {
  UPGRADE_CATEGORIES,
  calculateUpgradeCost,
  isUpgradeUnlocked,
  isBranchBlocked,
  getActiveSynergies,
} from '../config/upgradeConfig';

const CAT_COLORS = {
  attack:  '#ff6644',
  defense: '#4488ff',
  utility: '#ffd700',
};

export default function UpgradePanel({ upgrades, money, tower, onUpgrade, onClose, currentWave }) {
  const [activeCategory, setActiveCategory] = useState('attack');
  const [confirmBranch, setConfirmBranch] = useState(null); // 분기 확인 다이얼로그

  const category = UPGRADE_CATEGORIES[activeCategory];
  const catColor = CAT_COLORS[activeCategory];

  const getLevel = (id) => upgrades[id] || 0;
  const getCost = (u) => calculateUpgradeCost({ ...u, currentLevel: getLevel(u.id) });
  const isMaxed = (u) => u.maxLevel && getLevel(u.id) >= u.maxLevel;
  const isUnlocked = (u) => isUpgradeUnlocked({ ...u, category: activeCategory }, upgrades, currentWave || 0);
  const isBranchLocked = (u) => isBranchBlocked({ ...u, category: activeCategory }, upgrades);
  const canAfford = (u) => money >= getCost(u);
  const canBuy = (u) => !isMaxed(u) && isUnlocked(u) && !isBranchLocked(u) && canAfford(u);

  const activeSynergies = getActiveSynergies(upgrades);

  const handleUpgradeClick = (u) => {
    if (!canBuy(u)) return;
    // 분기 업그레이드는 확인 다이얼로그
    if (u.tier === 3) {
      setConfirmBranch(u);
    } else {
      onUpgrade(u);
    }
  };

  const handleConfirmBranch = () => {
    if (confirmBranch) {
      onUpgrade(confirmBranch);
      setConfirmBranch(null);
    }
  };

  // Tier별 그룹핑
  const tier1 = category.upgrades.filter(u => u.tier === 1);
  const tier2 = category.upgrades.filter(u => u.tier === 2);
  const tier3 = category.upgrades.filter(u => u.tier === 3);

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', zIndex: 100, backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#080810', margin: 10, borderRadius: 12, border: `2px solid ${catColor}66`, boxShadow: `0 0 30px ${catColor}33`, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          <span style={{ color: catColor, fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', textShadow: `0 0 10px ${catColor}`, letterSpacing: 2 }}>
            UPGRADE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>💰</span>
            <span style={{ color: '#ffd700', fontFamily: 'monospace', fontSize: 15, fontWeight: 'bold', textShadow: '0 0 8px #ffd700' }}>{money}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', width: 34, height: 34, borderRadius: 6, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'manipulation' }}>×</button>
        </div>

        {/* 카테고리 탭 */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 10px', flexShrink: 0 }}>
          {Object.values(UPGRADE_CATEGORIES).map(cat => {
            const cc = CAT_COLORS[cat.id];
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ flex: 1, padding: '8px 0', background: active ? `${cc}22` : 'rgba(255,255,255,0.03)', border: `2px solid ${active ? cc : 'rgba(255,255,255,0.12)'}`, borderRadius: 7, color: active ? cc : 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', textShadow: active ? `0 0 6px ${cc}` : 'none', touchAction: 'manipulation' }}>
                {cat.icon} {cat.name}
              </button>
            );
          })}
        </div>

        {/* 업그레이드 목록 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>

          {/* 활성 시너지 */}
          {activeSynergies.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {activeSynergies.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.35)', borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>⚡</span>
                  <div>
                    <span style={{ color: '#ffd700', fontFamily: 'monospace', fontSize: 10, fontWeight: 'bold' }}>{s.name}</span>
                    <div style={{ color: 'rgba(255,215,0,0.6)', fontFamily: 'monospace', fontSize: 9 }}>{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tier 1 */}
          <TierSection title="TIER 1" color={catColor} />
          {tier1.map(u => <UpgradeRow key={u.id} u={u} getLevel={getLevel} getCost={getCost} isMaxed={isMaxed} isUnlocked={isUnlocked} isBranchLocked={isBranchLocked} canBuy={canBuy} catColor={catColor} onClick={handleUpgradeClick} />)}

          {/* Tier 2 */}
          {tier2.length > 0 && (
            <>
              <TierSection title="TIER 2" color={catColor} desc="선행 업그레이드 필요" />
              {tier2.map(u => <UpgradeRow key={u.id} u={u} getLevel={getLevel} getCost={getCost} isMaxed={isMaxed} isUnlocked={isUnlocked} isBranchLocked={isBranchLocked} canBuy={canBuy} catColor={catColor} onClick={handleUpgradeClick} upgrades={upgrades} currentWave={currentWave} />)}
            </>
          )}

          {/* Tier 3 분기 */}
          {tier3.length > 0 && (
            <>
              <TierSection title="TIER 3 분기" color="#ff00ff" desc="되돌릴 수 없음 — 택1" />
              <div style={{ display: 'flex', gap: 6 }}>
                {tier3.map(u => <BranchCard key={u.id} u={u} getLevel={getLevel} getCost={getCost} isMaxed={isMaxed} isUnlocked={isUnlocked} isBranchLocked={isBranchLocked} canBuy={canBuy} catColor={catColor} onClick={handleUpgradeClick} upgrades={upgrades} currentWave={currentWave} />)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 분기 확인 다이얼로그 */}
      {confirmBranch && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={() => setConfirmBranch(null)}>
          <div style={{ background: '#0c0c18', border: '2px solid #ff00ff', borderRadius: 12, padding: 20, maxWidth: 280, margin: 16, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#ff00ff', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', marginBottom: 8, textShadow: '0 0 8px #ff00ff' }}>분기 선택: {confirmBranch.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: 11, marginBottom: 6 }}>{confirmBranch.description}</div>
            <div style={{ color: '#ff4444', fontFamily: 'monospace', fontSize: 10, marginBottom: 16 }}>⚠ 이 선택은 되돌릴 수 없습니다</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmBranch(null)} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: 7, fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', touchAction: 'manipulation' }}>취소</button>
              <button onClick={handleConfirmBranch} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,0,255,0.15)', border: '2px solid #ff00ff', color: '#ff00ff', borderRadius: 7, fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', cursor: 'pointer', touchAction: 'manipulation', textShadow: '0 0 6px #ff00ff' }}>확인 💰{getCost(confirmBranch)}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TierSection({ title, color, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 5 }}>
      <span style={{ color, fontFamily: 'monospace', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, textShadow: `0 0 6px ${color}` }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: `${color}44` }} />
      {desc && <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: 8 }}>{desc}</span>}
    </div>
  );
}

function UpgradeRow({ u, getLevel, getCost, isMaxed, isUnlocked, isBranchLocked, canBuy, catColor, onClick, upgrades, currentWave }) {
  const level = getLevel(u.id);
  const cost = getCost(u);
  const maxed = isMaxed(u);
  const unlocked = isUnlocked(u);
  const branchLocked = isBranchLocked(u);
  const affordable = canBuy(u);
  const locked = !unlocked || branchLocked;

  const reqText = u.requires?.id
    ? `선행: ${u.requires.id} Lv${u.requires.level}${u.requires.wave ? ` + W${u.requires.wave}` : ''}`
    : u.requires?.wave ? `W${u.requires.wave} 도달 필요` : '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', marginBottom: 5, background: maxed ? 'rgba(255,215,0,0.05)' : locked ? 'rgba(255,255,255,0.02)' : affordable ? `${catColor}0d` : 'rgba(255,255,255,0.02)', border: `1px solid ${maxed ? 'rgba(255,215,0,0.3)' : locked ? 'rgba(255,255,255,0.06)' : affordable ? `${catColor}44` : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, opacity: locked ? 0.5 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
          <span style={{ color: maxed ? '#ffd700' : locked ? 'rgba(255,255,255,0.3)' : affordable ? catColor : 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' }}>
            {locked && '🔒'}{u.name}
          </span>
          {level > 0 && (
            <span style={{ background: maxed ? 'rgba(255,215,0,0.15)' : `${catColor}22`, color: maxed ? '#ffd700' : catColor, padding: '1px 4px', borderRadius: 3, fontSize: 8, fontFamily: 'monospace' }}>
              Lv{level}{u.maxLevel ? `/${u.maxLevel}` : ''}
            </span>
          )}
        </div>
        <div style={{ color: 'rgba(200,200,200,0.5)', fontSize: 9, fontFamily: 'monospace' }}>{u.description}</div>
        {locked && reqText && (
          <div style={{ color: 'rgba(255,165,0,0.6)', fontSize: 8, fontFamily: 'monospace', marginTop: 1 }}>{reqText}</div>
        )}
      </div>

      <button onClick={() => !locked && !maxed && onClick(u)} style={{ flexShrink: 0, background: maxed ? 'rgba(255,215,0,0.1)' : locked ? 'rgba(255,255,255,0.04)' : affordable ? `${catColor}22` : 'rgba(255,255,255,0.04)', border: `2px solid ${maxed ? 'rgba(255,215,0,0.4)' : locked ? 'rgba(255,255,255,0.1)' : affordable ? catColor : 'rgba(255,255,255,0.12)'}`, color: maxed ? '#ffd700' : locked ? 'rgba(255,255,255,0.2)' : affordable ? catColor : 'rgba(255,255,255,0.25)', padding: '0 8px', height: 42, borderRadius: 7, fontFamily: 'monospace', fontSize: 10, cursor: affordable && !locked && !maxed ? 'pointer' : 'default', minWidth: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, touchAction: 'manipulation', textShadow: affordable && !locked ? `0 0 5px ${catColor}` : 'none' }}>
        {maxed ? <span>MAX</span> : locked ? <span style={{ fontSize: 14 }}>🔒</span> : <><span style={{ fontSize: 10 }}>💰</span><span>{cost}</span></>}
      </button>
    </div>
  );
}

function BranchCard({ u, getLevel, getCost, isMaxed, isUnlocked, isBranchLocked, canBuy, catColor, onClick, upgrades, currentWave }) {
  const level = getLevel(u.id);
  const cost = getCost(u);
  const maxed = isMaxed(u);
  const unlocked = isUnlocked(u);
  const branchLocked = isBranchLocked(u);
  const affordable = canBuy(u);
  const owned = level > 0;
  const locked = !unlocked || branchLocked;

  const reqText = `W${u.requires?.wave || '?'} + Tier2 ${u.requires?.tier2Count || '?'}종`;

  return (
    <div onClick={() => !locked && !maxed && onClick(u)} style={{ flex: 1, padding: '12px 10px', background: owned ? `${catColor}1a` : locked ? 'rgba(255,255,255,0.02)' : affordable ? `${catColor}0f` : 'rgba(255,255,255,0.03)', border: `2px solid ${owned ? catColor : locked ? 'rgba(255,255,255,0.08)' : affordable ? `${catColor}55` : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, cursor: (!locked && !maxed && affordable) ? 'pointer' : 'default', opacity: locked ? 0.45 : 1, textAlign: 'center', touchAction: 'manipulation' }}>
      <div style={{ color: owned ? catColor : locked ? 'rgba(255,255,255,0.3)' : affordable ? catColor : 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 5, textShadow: owned || affordable ? `0 0 8px ${catColor}` : 'none' }}>
        {locked ? '🔒 ' : owned ? '✓ ' : ''}{u.name}
      </div>
      <div style={{ color: 'rgba(200,200,200,0.55)', fontSize: 9, fontFamily: 'monospace', marginBottom: 8 }}>{u.description}</div>
      {locked ? (
        <div style={{ color: 'rgba(255,165,0,0.6)', fontSize: 8, fontFamily: 'monospace' }}>{reqText}</div>
      ) : owned ? (
        <div style={{ color: catColor, fontFamily: 'monospace', fontSize: 10 }}>선택됨</div>
      ) : (
        <div style={{ color: affordable ? catColor : 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold' }}>💰 {cost}</div>
      )}
    </div>
  );
}
