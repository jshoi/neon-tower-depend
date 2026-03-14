/**
 * 업그레이드 시스템 v2
 * 구조: Tier 1(선형) → Tier 2(조건부) → Tier 3(분기, 되돌릴 수 없음)
 * 시너지: 특정 조합 보유 시 자동 보너스 발동
 */

// ─────────────────────────────────────────
// 카테고리 정의
// ─────────────────────────────────────────
export const UPGRADE_CATEGORIES = {
  attack: {
    id: 'attack',
    name: '공격',
    icon: '⚔️',
    color: '#ff6644',
    upgrades: [
      // ── Tier 1 ──
      {
        id: 'dmg_up', tier: 1, name: '공격력 강화',
        description: '공격력 +15%',
        baseCost: 50, costScaling: 1.4,
        statKey: 'attackDamagePercent', increment: 15,
        maxLevel: 5, currentLevel: 0,
      },
      {
        id: 'atk_spd', tier: 1, name: '공격속도 향상',
        description: '공격속도 +10%',
        baseCost: 60, costScaling: 1.4,
        statKey: 'attackSpeedPercent', increment: 10,
        maxLevel: 5, currentLevel: 0,
      },
      {
        id: 'range_up', tier: 1, name: '사거리 확장',
        description: '사거리 +20%',
        baseCost: 40, costScaling: 1.35,
        statKey: 'attackRangePercent', increment: 20,
        maxLevel: 5, currentLevel: 0,
      },
      // ── Tier 2 ──
      {
        id: 'pierce', tier: 2, name: '관통 사격',
        description: '투사체가 추가 적 1명 관통',
        baseCost: 150, costScaling: 1.8,
        statKey: 'piercingShot', increment: 1,
        maxLevel: 3, currentLevel: 0,
        requires: { id: 'dmg_up', level: 3 },
      },
      {
        id: 'crit', tier: 2, name: '치명타',
        description: '치명타 확률 +10%, 피해 ×2',
        baseCost: 180, costScaling: 1.8,
        statKey: 'critChance', increment: 10,
        maxLevel: 5, currentLevel: 0,
        requires: { id: 'atk_spd', level: 3 },
      },
      {
        id: 'explosion', tier: 2, name: '폭발 탄환',
        description: '처치 시 범위 피해 +20',
        baseCost: 200, costScaling: 1.8,
        statKey: 'explosionDamage', increment: 20,
        maxLevel: 5, currentLevel: 0,
        requires: { id: 'range_up', level: 3 },
      },
      // ── Tier 3 분기 ── (웨이브 10 조건)
      {
        id: 'sniper', tier: 3, name: '저격수',
        description: '사거리+50%, 단일 피해×3, 공격속도-30%',
        baseCost: 400, costScaling: 1.0,
        statKey: '_sniper', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 2, wave: 10 },
        branch: 'A', branchGroup: 'attack_t3',
        isSpecial: true,
      },
      {
        id: 'gatling', tier: 3, name: '기관총',
        description: '공격속도+100%, 피해×0.6, 다중타겟+2',
        baseCost: 400, costScaling: 1.0,
        statKey: '_gatling', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 2, wave: 10 },
        branch: 'B', branchGroup: 'attack_t3',
        isSpecial: true,
      },
    ],
  },

  defense: {
    id: 'defense',
    name: '방어',
    icon: '🛡️',
    color: '#4488ff',
    upgrades: [
      // ── Tier 1 ──
      {
        id: 'hp_up', tier: 1, name: '최대 체력',
        description: '최대HP +20 증가',
        baseCost: 30, costScaling: 1.3,
        statKey: 'maxHealth', increment: 20,
        maxLevel: 10, currentLevel: 0,
      },
      {
        id: 'regen', tier: 1, name: 'HP 재생',
        description: '초당 HP 회복 +0.15',
        baseCost: 40, costScaling: 1.35,
        statKey: 'healthRegen', increment: 0.15,
        maxLevel: 10, currentLevel: 0,
      },
      {
        id: 'def_pct', tier: 1, name: '방어율',
        description: '받는 피해 -8%',
        baseCost: 60, costScaling: 1.5,
        statKey: 'defense', increment: 8,
        maxLevel: 6, currentLevel: 0,
      },
      // ── Tier 2 ──
      {
        id: 'abs_def', tier: 2, name: '절대방어',
        description: '받는 피해 고정 -3 감소',
        baseCost: 120, costScaling: 1.5,
        statKey: 'absoluteDefense', increment: 3,
        maxLevel: 5, currentLevel: 0,
        requires: { id: 'def_pct', level: 3 },
      },
      {
        id: 'thorn', tier: 2, name: '가시갑옷',
        description: '받은 피해의 20% 반사',
        baseCost: 140, costScaling: 1.6,
        statKey: 'thornPercent', increment: 20,
        maxLevel: 4, currentLevel: 0,
        requires: { id: 'def_pct', level: 3 },
      },
      {
        id: 'lifesteal', tier: 2, name: '흡혈',
        description: '처치 시 HP +3% 회복',
        baseCost: 160, costScaling: 1.6,
        statKey: 'lifeSteal', increment: 3,
        maxLevel: 5, currentLevel: 0,
        requires: { id: 'regen', level: 3 },
      },
      {
        id: 'last_stand', tier: 2, name: '투지',
        description: 'HP 30% 이하 시 재생속도 ×3',
        baseCost: 150, costScaling: 1.5,
        statKey: '_lastStand', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { id: 'regen', level: 3 },
        isSpecial: true,
      },
      // ── Tier 3 분기 ── (웨이브 15 조건)
      {
        id: 'fortress', tier: 3, name: '불굴의 요새',
        description: '최대HP+100, 받는 피해-50%',
        baseCost: 500, costScaling: 1.0,
        statKey: '_fortress', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 3, wave: 15 },
        branch: 'A', branchGroup: 'defense_t3',
        isSpecial: true,
      },
      {
        id: 'agile', tier: 3, name: '기동 방패',
        description: '방어율+25%, 회피율 20%',
        baseCost: 500, costScaling: 1.0,
        statKey: '_agile', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 3, wave: 15 },
        branch: 'B', branchGroup: 'defense_t3',
        isSpecial: true,
      },
    ],
  },

  utility: {
    id: 'utility',
    name: '유틸',
    icon: '⭐',
    color: '#ffd700',
    upgrades: [
      // ── Tier 1 ──
      {
        id: 'coin_bonus', tier: 1, name: '코인 보너스',
        description: '코인 획득 +20%',
        baseCost: 45, costScaling: 1.4,
        statKey: 'coinBonusPercent', increment: 20,
        maxLevel: 5, currentLevel: 0,
        isGlobal: true,
      },
      {
        id: 'multi_shot', tier: 1, name: '다중 공격',
        description: '동시 타겟 +1',
        baseCost: 100, costScaling: 1.8,
        statKey: 'multiShot', increment: 1,
        maxLevel: 3, currentLevel: 0,
      },
      {
        id: 'slow', tier: 1, name: '둔화',
        description: '적 이동속도 -15%',
        baseCost: 90, costScaling: 1.5,
        statKey: 'slowEffect', increment: 15,
        maxLevel: 5, currentLevel: 0,
      },
      // ── Tier 2 ──
      {
        id: 'poison', tier: 2, name: '독 도포',
        description: '적에게 3초간 초당 5% HP 독 피해',
        baseCost: 180, costScaling: 1.7,
        statKey: 'poisonDamage', increment: 5,
        maxLevel: 4, currentLevel: 0,
        requires: { id: 'slow', level: 3 },
      },
      {
        id: 'freeze', tier: 2, name: '빙결',
        description: '적 20% 확률로 1초 빙결',
        baseCost: 200, costScaling: 1.8,
        statKey: 'freezeChance', increment: 20,
        maxLevel: 3, currentLevel: 0,
        requires: { id: 'slow', level: 3 },
      },
      {
        id: 'wave_bonus', tier: 2, name: '웨이브 보상',
        description: '웨이브 클리어 코인 +30%',
        baseCost: 130, costScaling: 1.5,
        statKey: 'waveBonus', increment: 30,
        maxLevel: 5, currentLevel: 0,
        requires: { id: 'coin_bonus', level: 3 },
        isGlobal: true,
      },
      {
        id: 'chain', tier: 2, name: '연쇄 공격',
        description: '처치 시 인접 적에 50% 추가 피해',
        baseCost: 220, costScaling: 1.8,
        statKey: 'chainDamage', increment: 50,
        maxLevel: 3, currentLevel: 0,
        requires: { id: 'multi_shot', level: 2 },
      },
      // ── Tier 3 분기 ── (웨이브 20 조건)
      {
        id: 'economy', tier: 3, name: '경제 타워',
        description: '매 웨이브 클리어마다 코인 +100',
        baseCost: 600, costScaling: 1.0,
        statKey: '_economy', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 2, wave: 20 },
        branch: 'A', branchGroup: 'utility_t3',
        isSpecial: true,
        isGlobal: true,
      },
      {
        id: 'support', tier: 3, name: '지원 오라',
        description: '전체 공격력·속도 +20%',
        baseCost: 600, costScaling: 1.0,
        statKey: '_support', increment: 1,
        maxLevel: 1, currentLevel: 0,
        requires: { tier2Count: 2, wave: 20 },
        branch: 'B', branchGroup: 'utility_t3',
        isSpecial: true,
      },
    ],
  },
};

// ─────────────────────────────────────────
// 시너지 정의
// ─────────────────────────────────────────
export const SYNERGIES = [
  {
    id: 'atk_mastery',
    name: '전사의 분노',
    description: '공격 업그레이드 4종 이상 보유 시 공격력 +25%',
    condition: (upgrades) => {
      const atkIds = ['dmg_up','atk_spd','range_up','pierce','crit','explosion','sniper','gatling'];
      return atkIds.filter(id => (upgrades[id] || 0) > 0).length >= 4;
    },
    effect: { attackDamageBonus: 25 },
  },
  {
    id: 'def_mastery',
    name: '철벽',
    description: '방어 업그레이드 4종 이상 보유 시 피해 무효화 5%',
    condition: (upgrades) => {
      const defIds = ['hp_up','regen','def_pct','abs_def','thorn','lifesteal','last_stand','fortress','agile'];
      return defIds.filter(id => (upgrades[id] || 0) > 0).length >= 4;
    },
    effect: { damageNullify: 5 },
  },
  {
    id: 'util_mastery',
    name: '전략가',
    description: '유틸 업그레이드 4종 이상 보유 시 코인 획득 +30%',
    condition: (upgrades) => {
      const utilIds = ['coin_bonus','multi_shot','slow','poison','freeze','wave_bonus','chain','economy','support'];
      return utilIds.filter(id => (upgrades[id] || 0) > 0).length >= 4;
    },
    effect: { coinBonusFlat: 30 },
  },
  {
    id: 'blood_revenge',
    name: '피의 복수',
    description: '가시갑옷 + 흡혈 보유 시 반사 피해로 흡혈 발동',
    condition: (upgrades) => (upgrades['thorn'] || 0) > 0 && (upgrades['lifesteal'] || 0) > 0,
    effect: { thornLifesteal: true },
  },
  {
    id: 'ice_poison',
    name: '얼음 독',
    description: '빙결 + 독 도포 보유 시 빙결 적에게 독 피해 ×2',
    condition: (upgrades) => (upgrades['freeze'] || 0) > 0 && (upgrades['poison'] || 0) > 0,
    effect: { frozenPoisonMult: 2 },
  },
  {
    id: 'sniper_poison',
    name: '맹독 저격',
    description: '저격수 + 독 도포 보유 시 독 지속시간 ×3',
    condition: (upgrades) => (upgrades['sniper'] || 0) > 0 && (upgrades['poison'] || 0) > 0,
    effect: { poisonDurationMult: 3 },
  },
];

// ─────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────

/** 업그레이드 비용 계산 */
export function calculateUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, upgrade.currentLevel || 0));
}

/** 모든 업그레이드를 flat 배열로 반환 */
export function getAllUpgrades() {
  const result = [];
  Object.values(UPGRADE_CATEGORIES).forEach(cat => {
    cat.upgrades.forEach(u => result.push({ ...u, category: cat.id }));
  });
  return result;
}

/** 특정 업그레이드의 잠금 해제 여부 확인 */
export function isUpgradeUnlocked(upgrade, upgrades, currentWave) {
  if (!upgrade.requires) return true;

  const req = upgrade.requires;

  // 선행 업그레이드 레벨 조건
  if (req.id) {
    const currentLevel = upgrades[req.id] || 0;
    if (currentLevel < req.level) return false;
  }

  // Tier 2 업그레이드 보유 수 조건 (Tier 3 분기)
  if (req.tier2Count !== undefined) {
    const cat = upgrade.category;
    const catUpgrades = UPGRADE_CATEGORIES[cat]?.upgrades || [];
    const tier2Owned = catUpgrades.filter(u => u.tier === 2 && (upgrades[u.id] || 0) > 0).length;
    if (tier2Owned < req.tier2Count) return false;
  }

  // 웨이브 도달 조건
  if (req.wave !== undefined) {
    if (currentWave < req.wave) return false;
  }

  return true;
}

/** 분기 그룹 내 다른 분기가 이미 선택됐는지 확인 */
export function isBranchBlocked(upgrade, upgrades) {
  if (!upgrade.branchGroup) return false;
  const allUpgrades = getAllUpgrades();
  const sameGroup = allUpgrades.filter(u => u.branchGroup === upgrade.branchGroup && u.id !== upgrade.id);
  return sameGroup.some(u => (upgrades[u.id] || 0) > 0);
}

/** 활성화된 시너지 목록 반환 */
export function getActiveSynergies(upgrades) {
  return SYNERGIES.filter(s => s.condition(upgrades));
}

/** 시너지 효과를 반영한 보너스 스탯 계산 */
export function calcSynergyBonuses(upgrades) {
  const bonuses = {
    attackDamageBonus: 0,
    damageNullify: 0,
    coinBonusFlat: 0,
    thornLifesteal: false,
    frozenPoisonMult: 1,
    poisonDurationMult: 1,
  };
  getActiveSynergies(upgrades).forEach(s => {
    Object.entries(s.effect).forEach(([key, val]) => {
      if (typeof val === 'boolean') {
        bonuses[key] = val;
      } else if (key === 'frozenPoisonMult' || key === 'poisonDurationMult') {
        bonuses[key] = Math.max(bonuses[key], val);
      } else {
        bonuses[key] += val;
      }
    });
  });
  return bonuses;
}
