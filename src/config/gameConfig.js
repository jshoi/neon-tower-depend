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
    x: 390 / 2,
    y: 720 / 2,
    size: 26,
    // 신규 스탯
    poisonDamage: 0,       // 독 데미지 (% per sec)
    freezeChance: 0,       // 빙결 확률 (%)
    chainDamage: 0,        // 연쇄 공격 (처치 시 인접 피해%)
    critChance: 0,         // 치명타 확률 (%)
    piercingShot: 0,       // 관통 추가 수
    explosionDamage: 0,    // 폭발 범위 피해
    waveBonus: 0,          // 웨이브 보상 보너스 (%)
    evasion: 0,            // 회피율 (%) — fortress/agile 분기
    damageReduction: 0,    // 추가 피해 감소 (%) — fortress 분기
  },

  // 적 기본 스탯
  enemy: {
    baseHealth: 30,
    baseDamage: 5,
    baseSpeed: 1.5,
    baseReward: 10,
    size: 9,
  },

  // 적 유형별 배율
  enemyTypes: {
    BASIC: {
      label: '기본형',
      speedMult: 1.0,
      hpMult: 1.0,
      damageMult: 1.0,
      size: 9,
      reward: 1.0,
      // 특수능력 없음
    },
    SPEEDER: {
      label: '돌진형',
      speedMult: 2.0,
      hpMult: 0.5,
      damageMult: 1.0,
      size: 7,
      reward: 0.8,
      rushRange: 80,     // 타워 반경 내 돌진 거리
      rushMult: 1.5,     // 돌진 시 속도 배율
    },
    TANK: {
      label: '탱커형',
      speedMult: 0.47,
      hpMult: 4.0,
      damageMult: 3.0,
      size: 13,
      reward: 1.5,
      armor: 0.30,       // 피해 감소율
    },
    SPLITTER: {
      label: '분열형',
      speedMult: 0.8,
      hpMult: 1.7,
      damageMult: 2.0,
      size: 11,
      reward: 1.2,
      splitCount: 2,     // 사망 시 BASIC 생성 수
    },
    REGEN: {
      label: '재생형',
      speedMult: 0.67,
      hpMult: 1.3,
      damageMult: 2.0,
      size: 10,
      reward: 1.3,
      regenRate: 15,     // HP/s 재생
    },
    GHOST: {
      label: '유령형',
      speedMult: 1.3,
      hpMult: 0.8,
      damageMult: 1.0,
      size: 8,
      reward: 1.1,
      evasion: 0.30,       // 30% 회피
      invincibleInterval: 6000,  // ms 마다
      invincibleDuration: 500,   // ms 무적
    },
    BOSS: {
      label: '보스',
      speedMult: 0.33,
      hpMult: 13.3,
      damageMult: 5.0,
      size: 20,
      reward: 5.0,
      enrageThreshold: 0.5,  // HP 비율 이하 시 분노
      enrageSpeedMult: 1.5,
      spawnOnDeath: 'SPEEDER',
      spawnCount: 3,
    },
  },

  // 웨이브별 적 구성 테이블 (18웨이브까지 하드코딩, 이후 동적 생성)
  waveComposition: {
    1:  [{ type: 'BASIC',    count: 5  }],
    2:  [{ type: 'BASIC',    count: 8  }],
    3:  [{ type: 'BASIC',    count: 10 }, { type: 'BOSS', count: 1 }],
    4:  [{ type: 'BASIC',    count: 8  }, { type: 'SPEEDER', count: 3 }],
    5:  [{ type: 'BASIC',    count: 6  }, { type: 'SPEEDER', count: 6 }],
    6:  [{ type: 'BASIC',    count: 4  }, { type: 'SPEEDER', count: 8 }, { type: 'BOSS', count: 1 }],
    7:  [{ type: 'BASIC',    count: 6  }, { type: 'SPEEDER', count: 4 }, { type: 'TANK', count: 2 }],
    8:  [{ type: 'BASIC',    count: 4  }, { type: 'SPEEDER', count: 6 }, { type: 'TANK', count: 3 }],
    9:  [{ type: 'BASIC',    count: 4  }, { type: 'SPEEDER', count: 4 }, { type: 'TANK', count: 4 }, { type: 'BOSS', count: 1 }],
    10: [{ type: 'BASIC',    count: 4  }, { type: 'SPEEDER', count: 4 }, { type: 'TANK', count: 2 }, { type: 'SPLITTER', count: 4 }],
    11: [{ type: 'BASIC',    count: 4  }, { type: 'SPLITTER', count: 6 }, { type: 'SPEEDER', count: 4 }, { type: 'TANK', count: 2 }],
    12: [{ type: 'BASIC',    count: 4  }, { type: 'SPLITTER', count: 6 }, { type: 'TANK', count: 3 }, { type: 'BOSS', count: 1 }],
    13: [{ type: 'BASIC',    count: 4  }, { type: 'SPLITTER', count: 4 }, { type: 'REGEN', count: 3 }, { type: 'TANK', count: 2 }],
    14: [{ type: 'BASIC',    count: 4  }, { type: 'REGEN',    count: 5 }, { type: 'SPEEDER', count: 4 }, { type: 'TANK', count: 2 }],
    15: [{ type: 'BASIC',    count: 3  }, { type: 'SPEEDER', count: 3 }, { type: 'TANK', count: 2 }, { type: 'SPLITTER', count: 3 }, { type: 'REGEN', count: 3 }, { type: 'BOSS', count: 1 }],
    16: [{ type: 'BASIC',    count: 4  }, { type: 'REGEN',    count: 4 }, { type: 'GHOST', count: 4 }],
    17: [{ type: 'GHOST',    count: 6  }, { type: 'TANK',     count: 2 }, { type: 'SPLITTER', count: 3 }, { type: 'REGEN', count: 2 }],
    18: [{ type: 'BASIC',    count: 3  }, { type: 'SPEEDER', count: 3 }, { type: 'TANK', count: 2 }, { type: 'SPLITTER', count: 3 }, { type: 'REGEN', count: 3 }, { type: 'GHOST', count: 3 }, { type: 'BOSS', count: 1 }],
  },

  // 웨이브 설정
  wave: {
    initialEnemies: 5,
    enemyIncreasePerWave: 2,
    healthScaling: 1.15,
    damageScaling: 1.1,
    speedScaling: 0.04,
    spawnInterval: 1200,
    waveBreakDuration: 4000,
  },

  // 게임 진행
  game: {
    fps: 60,
    startingMoney: 50,
  },
};
