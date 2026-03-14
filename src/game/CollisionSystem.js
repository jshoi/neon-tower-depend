import { isEnemyAtTower } from './EnemySystem';
import { towerTakeDamage } from './TowerSystem';
import { damageEnemy } from './EnemySystem';

/**
 * 적과 타워 충돌 처리
 * TANK 아머, GHOST 무적 모두 damageEnemy 내에서 처리됨
 */
export function processCollisions(tower, enemies, deltaTime) {
  let updatedTower = { ...tower };
  let updatedEnemies = [...enemies];
  const events = [];
  const rewards = [];

  updatedEnemies = updatedEnemies.map(enemy => {
    if (enemy.isDead) return enemy;

    if (isEnemyAtTower(enemy, tower.x, tower.y, tower.size)) {
      if (enemy.attackCooldown <= 0) {
        const { tower: damagedTower, actualDamage, thornDamageToEnemy } =
          towerTakeDamage(updatedTower, enemy);
        updatedTower = damagedTower;

        if (actualDamage > 0) {
          events.push({ type: 'tower_hit', damage: actualDamage, x: tower.x, y: tower.y });
        }

        // 가시 피해 반사
        if (thornDamageToEnemy > 0) {
          const damagedEnemy = damageEnemy(enemy, thornDamageToEnemy, true);
          if (damagedEnemy.isDead) {
            rewards.push({ x: enemy.x, y: enemy.y, amount: enemy.reward, type: enemy.type });
            events.push({ type: 'enemy_killed', x: enemy.x, y: enemy.y });
          }
          return { ...damagedEnemy, attackCooldown: enemy.attackInterval };
        }

        return { ...enemy, attackCooldown: enemy.attackInterval };
      }
    }

    return enemy;
  });

  return { tower: updatedTower, enemies: updatedEnemies, events, rewards };
}
