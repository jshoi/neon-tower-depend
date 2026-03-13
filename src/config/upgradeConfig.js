export const UPGRADE_CATEGORIES = {
  attack: {
    id: 'attack',
    name: '공격',
    icon: '⚔️',
    upgrades: [
      {
        id: 'damage',
        name: '공격력 강화',
        description: '기본 공격 데미지 +5 증가',
        baseCost: 50,
        costScaling: 1.5,
        statKey: 'attackDamage',
        increment: 5,
        currentLevel: 0,
        maxLevel: 20,
      },
      {
        id: 'attackSpeed',
        name: '공격 속도',
        description: '초당 공격 횟수 +0.2 증가',
        baseCost: 60,
        costScaling: 1.5,
        statKey: 'attackSpeed',
        increment: 0.2,
        currentLevel: 0,
        maxLevel: 15,
      },
      {
        id: 'attackRange',
        name: '사거리 확장',
        description: '공격 사거리 +25 증가',
        baseCost: 40,
        costScaling: 1.4,
        statKey: 'attackRange',
        increment: 25,
        currentLevel: 0,
        maxLevel: 10,
      },
    ],
  },

  defense: {
    id: 'defense',
    name: '방어',
    icon: '🛡️',
    upgrades: [
      {
        id: 'health',
        name: '최대 체력',
        description: '최대 체력 +20 증가 (즉시 회복)',
        baseCost: 30,
        costScaling: 1.3,
        statKey: 'maxHealth',
        increment: 20,
        currentLevel: 0,
        maxLevel: 20,
      },
      {
        id: 'healthRegen',
        name: '체력 재생',
        description: '초당 체력 회복 +0.1 증가',
        baseCost: 40,
        costScaling: 1.4,
        statKey: 'healthRegen',
        increment: 0.1,
        currentLevel: 0,
        maxLevel: 20,
      },
      {
        id: 'defensePercent',
        name: '방어율',
        description: '받는 피해 5% 감소',
        baseCost: 60,
        costScaling: 1.6,
        statKey: 'defense',
        increment: 5,
        currentLevel: 0,
        maxLevel: 10,
      },
      {
        id: 'absoluteDefense',
        name: '절대 방어',
        description: '고정 피해 -2 감소',
        baseCost: 50,
        costScaling: 1.5,
        statKey: 'absoluteDefense',
        increment: 2,
        currentLevel: 0,
        maxLevel: 15,
      },
      {
        id: 'thornDamage',
        name: '가시 갑옷',
        description: '공격받을 때 반사 피해 +3',
        baseCost: 70,
        costScaling: 1.5,
        statKey: 'thornDamage',
        increment: 3,
        currentLevel: 0,
        maxLevel: 15,
      },
      {
        id: 'lifeSteal',
        name: '흡혈',
        description: '공격 시 데미지의 5% 체력 회복',
        baseCost: 80,
        costScaling: 1.7,
        statKey: 'lifeSteal',
        increment: 5,
        currentLevel: 0,
        maxLevel: 10,
      },
    ],
  },

  utility: {
    id: 'utility',
    name: '유틸리티',
    icon: '⭐',
    upgrades: [
      {
        id: 'coinBonus',
        name: '코인 보너스',
        description: '적 처치 시 코인 +2 추가',
        baseCost: 45,
        costScaling: 1.4,
        statKey: 'coinBonus',
        increment: 2,
        currentLevel: 0,
        maxLevel: 20,
        isGlobal: true,
      },
      {
        id: 'multiShot',
        name: '다중 공격',
        description: '동시에 공격하는 적 +1 증가',
        baseCost: 100,
        costScaling: 2.0,
        statKey: 'multiShot',
        increment: 1,
        currentLevel: 0,
        maxLevel: 3,
      },
      {
        id: 'slowEffect',
        name: '둔화 효과',
        description: '적 이동속도 10% 감소 효과 추가',
        baseCost: 90,
        costScaling: 1.8,
        statKey: 'slowEffect',
        increment: 10,
        currentLevel: 0,
        maxLevel: 5,
      },
    ],
  },
};

// 업그레이드 비용 계산 함수
export function calculateUpgradeCost(upgrade) {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costScaling, upgrade.currentLevel)
  );
}

// 업그레이드 목록을 flat 배열로 반환
export function getAllUpgrades() {
  const upgrades = [];
  Object.values(UPGRADE_CATEGORIES).forEach(category => {
    category.upgrades.forEach(upgrade => {
      upgrades.push({ ...upgrade, category: category.id });
    });
  });
  return upgrades;
}
