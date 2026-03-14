import { GAME_CONFIG } from '../config/gameConfig';
import { getSpawnPosition, distance } from '../utils/mathUtils';

let enemyIdCounter = 0;

/**
 * 적 생성 (타입 지정)
 */
export function createEnemy(wave, type = 'BASIC', overrideHpMult = 1) {
  const cfg = GAME_CONFIG;
  const base = cfg.enemy;
  const typeDef = cfg.enemyTypes[type] || cfg.enemyTypes.BASIC;
  const { healthScaling, damageScaling, speedScaling } = cfg.wave;
  const { width, height } = cfg.canvas;

  const spawnPos = getSpawnPosition(width, height);

  const baseHp = Math.floor(base.baseHealth * typeDef.hpMult * overrideHpMult * Math.pow(healthScaling, wave - 1));
  const baseDmg = Math.floor(base.baseDamage * typeDef.damageMult * Math.pow(damageScaling, wave - 1));
  const baseSpd = (base.baseSpeed * typeDef.speedMult) * (1 + wave * speedScaling);
  const reward = Math.floor((base.baseReward * typeDef.reward) + wave * 1.5);

  return {
    id: ++enemyIdCounter,
    type,
    wave,
    x: spawnPos.x,
    y: spawnPos.y,
    size: typeDef.size,
    health: baseHp,
    maxHealth: baseHp,
    damage: baseDmg,
    speed: baseSpd,
    baseSpeed: baseSpd,
    reward,

    // 공통
    slowFactor: 1.0,
    isDead: false,
    attackCooldown: 0,
    attackInterval: 1000,

    // 특수 상태
    armor: typeDef.armor || 0,          // TANK: 피해 감소
    isFrozen: false,
    frozenTimer: 0,
    poisoned: false,
    poisonTimer: 0,
    poisonDps: 0,
    poisonDurationMult: 1,

    // REGEN
    regenRate: typeDef.regenRate || 0,

    // GHOST
    evasion: typeDef.evasion || 0,
    invincibleInterval: typeDef.invincibleInterval || 0,
    invincibleDuration: typeDef.invincibleDuration || 0,
    invincibleTimer: 0,    // 다음 무적까지 카운트다운 (ms)
    isInvincible: false,
    invincibleActive: 0,   // 현재 무적 남은 시간 (ms)

    // BOSS
    enraged: false,
    enrageThreshold: typeDef.enrageThreshold || 0,
    enrageSpeedMult: typeDef.enrageSpeedMult || 1,

    // 시각 효과용
    trail: [],           // SPEEDER trail 위치 배열
    glowPhase: Math.random() * Math.PI * 2,  // 글로우 애니메이션 위상
  };
}

/**
 * 특정 위치에 적 스폰 (분열/보스 사망 시 사용)
 */
export function spawnEnemyAt(wave, type, x, y) {
  const enemy = createEnemy(wave, type, 0.5);
  return { ...enemy, x, y };
}

/**
 * 적 이동 (타워를 향해)
 */
export function moveEnemy(enemy, towerX, towerY, deltaTime) {
  if (enemy.isFrozen || enemy.isDead) return enemy;

  const dist = distance(enemy.x, enemy.y, towerX, towerY);
  if (dist < 5) return enemy;

  let effectiveSpeed = enemy.speed * enemy.slowFactor;

  // SPEEDER: 타워 근접 시 돌진
  const typeDef = GAME_CONFIG.enemyTypes[enemy.type];
  if (enemy.type === 'SPEEDER' && typeDef?.rushRange) {
    if (dist <= typeDef.rushRange) {
      effectiveSpeed *= typeDef.rushMult;
    }
  }

  // BOSS: 분노 시 속도 증가
  if (enemy.enraged) {
    effectiveSpeed *= enemy.enrageSpeedMult;
  }

  const speedPerFrame = effectiveSpeed * (deltaTime / 16.67);
  const ratio = Math.min(speedPerFrame / dist, 1);
  const dx = (towerX - enemy.x) * ratio;
  const dy = (towerY - enemy.y) * ratio;

  // SPEEDER trail 업데이트
  let newTrail = enemy.trail;
  if (enemy.type === 'SPEEDER') {
    newTrail = [{ x: enemy.x, y: enemy.y }, ...enemy.trail.slice(0, 4)];
  }

  return {
    ...enemy,
    x: enemy.x + dx,
    y: enemy.y + dy,
    trail: newTrail,
  };
}

/**
 * 적 전체 업데이트 (이동 + 상태효과)
 */
export function updateEnemies(enemies, towerX, towerY, deltaTime) {
  return enemies.map(enemy => {
    if (enemy.isDead) return enemy;

    let e = { ...enemy };

    // 빙결 타이머
    if (e.isFrozen) {
      e.frozenTimer = Math.max(0, e.frozenTimer - deltaTime);
      if (e.frozenTimer <= 0) e.isFrozen = false;
    }

    // GHOST 무적 타이머
    if (e.invincibleInterval > 0) {
      if (e.isInvincible) {
        e.invincibleActive = Math.max(0, e.invincibleActive - deltaTime);
        if (e.invincibleActive <= 0) {
          e.isInvincible = false;
          e.invincibleTimer = e.invincibleInterval;
        }
      } else {
        e.invincibleTimer = Math.max(0, e.invincibleTimer - deltaTime);
        if (e.invincibleTimer <= 0) {
          e.isInvincible = true;
          e.invincibleActive = e.invincibleDuration;
        }
      }
    }

    // REGEN: HP 재생
    if (e.regenRate > 0 && e.health < e.maxHealth) {
      e.health = Math.min(e.maxHealth, e.health + e.regenRate * (deltaTime / 1000));
    }

    // 독 피해
    if (e.poisoned) {
      e.poisonTimer = Math.max(0, e.poisonTimer - deltaTime);
      const poisonDmg = (e.poisonDps / 100) * e.maxHealth * (deltaTime / 1000);
      e.health -= poisonDmg;
      if (e.poisonTimer <= 0) {
        e.poisoned = false;
        e.poisonDps = 0;
      }
      if (e.health <= 0) e.isDead = true;
    }

    // BOSS 분노 체크
    if (e.type === 'BOSS' && !e.enraged && e.enrageThreshold > 0) {
      if (e.health / e.maxHealth <= e.enrageThreshold) {
        e.enraged = true;
      }
    }

    // 이동 (빙결 아닐 때만)
    if (!e.isFrozen) {
      e = moveEnemy(e, towerX, towerY, deltaTime);
    }

    // 둔화 감쇠
    e.slowFactor = Math.min(1.0, e.slowFactor + 0.004);
    e.attackCooldown = Math.max(0, e.attackCooldown - deltaTime);

    // 글로우 위상 업데이트
    e.glowPhase = (e.glowPhase + deltaTime * 0.003) % (Math.PI * 2);

    return e;
  });
}

/**
 * 적이 타워 공격 범위 내에 있는지 확인
 */
export function isEnemyAtTower(enemy, towerX, towerY, towerSize) {
  return distance(enemy.x, enemy.y, towerX, towerY) < towerSize + enemy.size;
}

/**
 * 적에게 피해 입히기 (회피/무적/아머 처리 포함)
 */
export function damageEnemy(enemy, damage, ignoreEvasion = false) {
  // 무적
  if (enemy.isInvincible) return enemy;

  // GHOST 회피
  if (!ignoreEvasion && enemy.evasion > 0) {
    if (Math.random() < enemy.evasion) return enemy;
  }

  // TANK 아머
  let actualDamage = damage;
  if (enemy.armor > 0) {
    actualDamage = damage * (1 - enemy.armor);
  }

  const newHealth = enemy.health - actualDamage;
  return {
    ...enemy,
    health: newHealth,
    isDead: newHealth <= 0,
  };
}

/**
 * 적에게 둔화 효과 적용
 */
export function slowEnemy(enemy, slowPercent) {
  return {
    ...enemy,
    slowFactor: Math.max(0.2, enemy.slowFactor - slowPercent / 100),
  };
}

/**
 * 적에게 빙결 적용
 */
export function freezeEnemy(enemy, durationMs = 1000) {
  return {
    ...enemy,
    isFrozen: true,
    frozenTimer: durationMs,
    slowFactor: 0,
  };
}

/**
 * 적에게 독 적용
 */
export function poisonEnemy(enemy, dps, durationMs, durationMult = 1) {
  return {
    ...enemy,
    poisoned: true,
    poisonDps: dps,
    poisonTimer: durationMs * durationMult,
    poisonDurationMult: durationMult,
  };
}

/**
 * 죽은 적 제거, 보상 반환, 분열/보스 처리
 */
export function removeDeadEnemies(enemies, wave) {
  const rewards = [];
  const alive = [];
  const spawned = [];  // 분열/보스 사망으로 생성될 새 적

  enemies.forEach(enemy => {
    if (enemy.isDead) {
      rewards.push({ x: enemy.x, y: enemy.y, amount: enemy.reward, type: enemy.type });

      // SPLITTER: 분열
      const typeDef = GAME_CONFIG.enemyTypes[enemy.type];
      if (enemy.type === 'SPLITTER' && typeDef?.splitCount) {
        for (let i = 0; i < typeDef.splitCount; i++) {
          const offsetX = (i - (typeDef.splitCount - 1) / 2) * 24;
          spawned.push(spawnEnemyAt(enemy.wave, 'BASIC', enemy.x + offsetX, enemy.y));
        }
      }

      // BOSS: 사망 시 스폰
      if (enemy.type === 'BOSS' && typeDef?.spawnOnDeath) {
        for (let i = 0; i < typeDef.spawnCount; i++) {
          const angle = (Math.PI * 2 * i) / typeDef.spawnCount;
          const dist = 30;
          spawned.push(spawnEnemyAt(
            enemy.wave,
            typeDef.spawnOnDeath,
            enemy.x + Math.cos(angle) * dist,
            enemy.y + Math.sin(angle) * dist
          ));
        }
      }
    } else {
      alive.push(enemy);
    }
  });

  return { alive, rewards, spawned };
}
