import { GAME_CONFIG } from '../config/gameConfig';
import { distance, calculateDamage } from '../utils/mathUtils';
import { createAttackEffect } from '../utils/animationUtils';
import { damageEnemy, slowEnemy } from './EnemySystem';

/**
 * 초기 타워 상태 생성
 */
export function createTowerState() {
  const cfg = GAME_CONFIG.tower;
  return {
    ...cfg,
    attackCooldown: 0,       // 다음 공격까지 ms
    isAttacking: false,
    multiShot: 1,            // 동시 공격 적 수
    slowEffect: 0,           // 둔화 효과 %
    coinBonus: 0,            // 코인 보너스
  };
}

/**
 * 사거리 내 적 찾기 (가장 가까운 순서로 최대 multiShot 개)
 */
export function findTargets(tower, enemies) {
  const inRange = enemies
    .filter(e => !e.isDead)
    .map(e => ({
      enemy: e,
      dist: distance(tower.x, tower.y, e.x, e.y),
    }))
    .filter(({ dist }) => dist <= tower.attackRange)
    .sort((a, b) => a.dist - b.dist);

  return inRange.slice(0, tower.multiShot).map(({ enemy }) => enemy);
}

/**
 * 타워 공격 처리
 * Returns: { tower, enemies, effects, healing }
 */
export function processTowerAttack(tower, enemies, deltaTime) {
  let t = { ...tower };
  let updatedEnemies = [...enemies];
  const effects = [];
  let healing = 0;

  // 쿨다운 감소
  t.attackCooldown = Math.max(0, t.attackCooldown - deltaTime);

  if (t.attackCooldown <= 0) {
    const targets = findTargets(t, updatedEnemies);

    if (targets.length > 0) {
      const attackInterval = 1000 / t.attackSpeed; // ms per attack
      t.attackCooldown = attackInterval;
      t.isAttacking = true;

      targets.forEach(target => {
        // 피해 계산
        const rawDamage = t.attackDamage;
        const actualDamage = rawDamage; // 적에게 가하는 피해 (방어 미적용 - 적의 방어는 없음)

        // 흡혈 처리
        if (t.lifeSteal > 0) {
          healing += actualDamage * (t.lifeSteal / 100);
        }

        // 둔화 적용
        updatedEnemies = updatedEnemies.map(e => {
          if (e.id === target.id) {
            let damaged = damageEnemy(e, actualDamage);
            if (t.slowEffect > 0) {
              damaged = slowEnemy(damaged, t.slowEffect);
            }
            return damaged;
          }
          return e;
        });

        // 공격 이펙트 생성
        effects.push(createAttackEffect(t.x, t.y, target.x, target.y, '#00ffff'));
      });
    } else {
      t.isAttacking = false;
    }
  } else {
    t.isAttacking = false;
  }

  return { tower: t, enemies: updatedEnemies, effects, healing };
}

/**
 * 타워 체력 재생
 */
export function regenerateHealth(tower, deltaTime) {
  if (tower.health >= tower.maxHealth) return tower;
  const regenAmount = tower.healthRegen * (deltaTime / 1000);
  return {
    ...tower,
    health: Math.min(tower.maxHealth, tower.health + regenAmount),
  };
}

/**
 * 타워가 적에게 피해를 받음
 */
export function towerTakeDamage(tower, enemy) {
  const rawDamage = enemy.damage;
  const actualDamage = calculateDamage(
    rawDamage,
    tower.defense,
    tower.absoluteDefense
  );

  let newHealth = tower.health - actualDamage;

  // 가시 피해 (반사)
  let thornDamageToEnemy = 0;
  if (tower.thornDamage > 0) {
    thornDamageToEnemy = tower.thornDamage;
  }

  return {
    tower: {
      ...tower,
      health: Math.max(0, newHealth),
    },
    actualDamage,
    thornDamageToEnemy,
  };
}

/**
 * 업그레이드 적용
 */
export function applyUpgrade(tower, upgrade) {
  const { statKey, increment } = upgrade;

  let updatedTower = {
    ...tower,
    [statKey]: (tower[statKey] || 0) + increment,
  };

  // 최대 체력 증가 시 현재 체력도 비례 증가
  if (statKey === 'maxHealth') {
    updatedTower.health = Math.min(
      updatedTower.maxHealth,
      updatedTower.health + increment
    );
  }

  return updatedTower;
}

/**
 * 타워가 살아있는지 확인
 */
export function isTowerAlive(tower) {
  return tower.health > 0;
}
