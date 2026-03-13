export const GAME_CONFIG = {
  // 캔버스 설정
  canvas: {
    width: 800,
    height: 600,
  },

  // 타워 초기 스탯
  tower: {
    health: 100,
    maxHealth: 100,
    healthRegen: 0.1,       // 초당 회복량
    attackDamage: 10,
    attackSpeed: 1,          // 초당 공격 횟수
    attackRange: 200,
    defense: 0,              // 방어율 %
    absoluteDefense: 0,      // 절대 방어
    thornDamage: 0,          // 가시 손상
    lifeSteal: 0,            // 흡혈 %
    x: 400,
    y: 300,
    size: 30,
  },

  // 적 기본 스탯
  enemy: {
    baseHealth: 30,
    baseDamage: 5,
    baseSpeed: 1,
    baseReward: 10,          // 처치 시 코인
    size: 14,
  },

  // 웨이브 설정
  wave: {
    initialEnemies: 5,
    enemyIncreasePerWave: 2,
    healthScaling: 1.15,     // 웨이브당 체력 증가율
    damageScaling: 1.1,      // 웨이브당 공격력 증가율
    speedScaling: 0.05,      // 웨이브당 속도 증가율
    spawnInterval: 1500,     // ms
    waveBreakDuration: 4000, // 웨이브 사이 휴식 시간 ms
  },

  // 게임 진행
  game: {
    fps: 60,
    startingMoney: 50,
  },
};
