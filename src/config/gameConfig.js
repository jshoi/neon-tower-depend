export const GAME_CONFIG = {
  // 캔버스 설정 - 모바일 세로 비율 (9:19.5)
  canvas: {
    width: 390,
    height: 720,
  },

  // 타워 초기 스탯
  tower: {
    health: 100,
    maxHealth: 100,
    healthRegen: 0.1,
    attackDamage: 10,
    attackSpeed: 1,
    attackRange: 150,
    defense: 0,
    absoluteDefense: 0,
    thornDamage: 0,
    lifeSteal: 0,
    x: 390 / 2,   // 캔버스 중앙
    y: 720 / 2,
    size: 26,
  },

  // 적 기본 스탯
  enemy: {
    baseHealth: 30,
    baseDamage: 5,
    baseSpeed: 1,
    baseReward: 10,
    size: 12,
  },

  // 웨이브 설정
  wave: {
    initialEnemies: 5,
    enemyIncreasePerWave: 2,
    healthScaling: 1.15,
    damageScaling: 1.1,
    speedScaling: 0.05,
    spawnInterval: 1500,
    waveBreakDuration: 4000,
  },

  // 게임 진행
  game: {
    fps: 60,
    startingMoney: 50,
  },
};
