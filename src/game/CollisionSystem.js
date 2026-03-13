import { distance } from '../utils/mathUtils';
import { isEnemyAtTower } from './EnemySystem';
import { towerTakeDamage } from './TowerSystem';
import { damageEnemy } from './EnemySystem';

/**
 * 적과 타워 충돌 처리
 * Returns: { tower, enemies, events }
 * events: 'tower_hit', 'enemy_killed'
 */
export function processCollisions(tower, enemies, deltaTime) {
  let updatedTower = { ...tower };
  let updatedEnemies = [...enemies];
  const events = [];
  const rewards = [];

  updatedEnemies = updatedEnemies.map(enemy => {
    if (enemy.isDead) return enemy;

    // 적이 타워에 도달했는지 확인
    if (isEnemyAtTower(enemy, tower.x, tower.y, tower.size)) {
      // 공격 쿨다운 확인
      if (enemy.attackCooldown <= 0) {
        // 타워 피해 처리
        const { tower: damagedTower, thornDamageToEnemy } = towerTakeDamage(
          updatedTower,
          enemy
        );
        updatedTower = damagedTower;

        events.push({
          type: 'tower_hit',
          damage: enemy.damage,
          x: tower.x,
          y: tower.y,
        });

        // 가시 피해 적용
        if (thornDamageToEnemy > 0) {
          const damagedEnemy = damageEnemy(enemy, thornDamageToEnemy);
          if (damagedEnemy.isDead) {
            rewards.push({ x: enemy.x, y: enemy.y, amount: enemy.reward });
            events.push({ type: 'enemy_killed', x: enemy.x, y: enemy.y });
          }
          return {
            ...damagedEnemy,
            attackCooldown: enemy.attackInterval,
          };
        }

        return {
          ...enemy,
          attackCooldown: enemy.attackInterval,
        };
      }
    }

    return enemy;
  });

  return { tower: updatedTower, enemies: updatedEnemies, events, rewards };
}

/**
 * 발사체와 적 충돌 감지 (미래 확장용)
 */
export function checkProjectileCollisions(projectiles, enemies, radius = 10) {
  const hits = [];
  const survivingProjectiles = [];

  projectiles.forEach(proj => {
    let hit = false;
    enemies.forEach(enemy => {
      if (!hit && distance(proj.x, proj.y, enemy.x, enemy.y) < radius + enemy.size) {
        hits.push({ projectile: proj, enemy });
        hit = true;
      }
    });
    if (!hit) {
      survivingProjectiles.push(proj);
    }
  });

  return { hits, projectiles: survivingProjectiles };
}
