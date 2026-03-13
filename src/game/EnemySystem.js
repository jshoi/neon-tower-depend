import { GAME_CONFIG } from '../config/gameConfig';
import { getSpawnPosition, distance } from '../utils/mathUtils';

let enemyIdCounter = 0;

/**
 * 적 생성
 */
export function createEnemy(wave) {
  const cfg = GAME_CONFIG;
  const { baseHealth, baseDamage, baseSpeed, baseReward, size } = cfg.enemy;
  const { healthScaling, damageScaling, speedScaling } = cfg.wave;
  const { width, height } = cfg.canvas;

  const spawnPos = getSpawnPosition(width, height);

  return {
    id: ++enemyIdCounter,
    x: spawnPos.x,
    y: spawnPos.y,
    size,
    health: Math.floor(baseHealth * Math.pow(healthScaling, wave - 1)),
    maxHealth: Math.floor(baseHealth * Math.pow(healthScaling, wave - 1)),
    damage: Math.floor(baseDamage * Math.pow(damageScaling, wave - 1)),
    speed: baseSpeed * (1 + wave * speedScaling),
    reward: baseReward + Math.floor(wave * 1.5),
    slowFactor: 1.0,  // 둔화 효과 배수 (1.0 = 정상)
    isDead: false,
    attackCooldown: 0,  // ms
    attackInterval: 1000, // ms, 초당 1번 공격
  };
}

/**
 * 적 이동 (타워를 향해)
 */
export function moveEnemy(enemy, towerX, towerY, deltaTime) {
  const dist = distance(enemy.x, enemy.y, towerX, towerY);
  if (dist < 5) return enemy; // 타워에 도달

  const effectiveSpeed = enemy.speed * enemy.slowFactor;
  const speedPerFrame = effectiveSpeed * (deltaTime / 16.67); // 60fps 기준
  const ratio = Math.min(speedPerFrame / dist, 1);
  const dx = (towerX - enemy.x) * ratio;
  const dy = (towerY - enemy.y) * ratio;

  return {
    ...enemy,
    x: enemy.x + dx,
    y: enemy.y + dy,
  };
}

/**
 * 적 배치 업데이트 (이동 + 둔화 감쇠)
 */
export function updateEnemies(enemies, towerX, towerY, deltaTime) {
  return enemies.map(enemy => {
    if (enemy.isDead) return enemy;

    const moved = moveEnemy(enemy, towerX, towerY, deltaTime);

    // 둔화 효과 감쇠
    const newSlowFactor = Math.min(1.0, moved.slowFactor + 0.005);

    return {
      ...moved,
      slowFactor: newSlowFactor,
      attackCooldown: Math.max(0, moved.attackCooldown - deltaTime),
    };
  });
}

/**
 * 적이 타워 공격 범위 내에 있는지 확인
 */
export function isEnemyAtTower(enemy, towerX, towerY, towerSize) {
  return distance(enemy.x, enemy.y, towerX, towerY) < towerSize + enemy.size;
}

/**
 * 특정 적에게 피해 입히기
 */
export function damageEnemy(enemy, damage) {
  const newHealth = enemy.health - damage;
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
 * 죽은 적 제거 및 보상 반환
 */
export function removeDeadEnemies(enemies) {
  const rewards = [];
  const alive = [];

  enemies.forEach(enemy => {
    if (enemy.isDead) {
      rewards.push({ x: enemy.x, y: enemy.y, amount: enemy.reward });
    } else {
      alive.push(enemy);
    }
  });

  return { alive, rewards };
}
