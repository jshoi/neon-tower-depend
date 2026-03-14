import { GAME_CONFIG } from '../config/gameConfig';
import { distance, calculateDamage } from '../utils/mathUtils';
import { createAttackEffect } from '../utils/animationUtils';
import { damageEnemy, slowEnemy, freezeEnemy, poisonEnemy } from './EnemySystem';

/**
 * 초기 타워 상태 생성
 */
export function createTowerState() {
  const cfg = GAME_CONFIG.tower;
  return {
    ...cfg,
    attackCooldown: 0,
    isAttacking: false,
    multiShot: 1,
    slowEffect: 0,
    coinBonus: 0,
    // 추가 스탯 (upgradeConfig v2)
    attackDamagePercent: 0,
    attackSpeedPercent: 0,
    attackRangePercent: 0,
    thornPercent: 0,
    coinBonusPercent: 0,
    waveBonus: 0,
    // 분기 플래그
    hasSniper: false,
    hasGatling: false,
    hasFortress: false,
    hasAgile: false,
    hasLastStand: false,
    hasEconomy: false,
    hasSupport: false,
    // 시너지 보너스 (GameManager에서 주입)
    synergyBonuses: null,
  };
}

/**
 * 타워의 실제 스탯 계산 (퍼센트 증가 + 분기 + 시너지 반영)
 */
export function calcEffectiveStats(tower) {
  const b = tower.synergyBonuses || {};

  let atkDmg = tower.attackDamage * (1 + tower.attackDamagePercent / 100);
  let atkSpd = tower.attackSpeed  * (1 + tower.attackSpeedPercent  / 100);
  let atkRng = tower.attackRange  * (1 + tower.attackRangePercent  / 100);
  let multi  = tower.multiShot;

  // 지원 오라 분기
  if (tower.hasSupport) {
    atkDmg *= 1.2;
    atkSpd *= 1.2;
  }

  // 시너지: 전사의 분노
  if (b.attackDamageBonus) {
    atkDmg *= (1 + b.attackDamageBonus / 100);
  }

  // 저격수 분기
  if (tower.hasSniper) {
    atkRng *= 1.5;
    atkDmg *= 3.0;
    atkSpd *= 0.7;
    multi = 1;
  }

  // 기관총 분기
  if (tower.hasGatling) {
    atkSpd *= 2.0;
    atkDmg *= 0.6;
    multi += 2;
  }

  return { atkDmg, atkSpd, atkRng, multi };
}

/**
 * 사거리 내 적 찾기 (가장 가까운 순서)
 */
export function findTargets(tower, enemies, effectiveRange, effectiveMulti) {
  const inRange = enemies
    .filter(e => !e.isDead)
    .map(e => ({ enemy: e, dist: distance(tower.x, tower.y, e.x, e.y) }))
    .filter(({ dist }) => dist <= effectiveRange)
    .sort((a, b) => a.dist - b.dist);

  return inRange.slice(0, effectiveMulti).map(({ enemy }) => enemy);
}

/**
 * 타워 공격 처리
 */
export function processTowerAttack(tower, enemies, deltaTime) {
  let t = { ...tower };
  let updatedEnemies = [...enemies];
  const effects = [];
  let healing = 0;
  const { atkDmg, atkSpd, atkRng, multi } = calcEffectiveStats(t);
  const synergy = t.synergyBonuses || {};

  t.attackCooldown = Math.max(0, t.attackCooldown - deltaTime);

  if (t.attackCooldown <= 0) {
    const targets = findTargets(t, updatedEnemies, atkRng, multi);

    if (targets.length > 0) {
      t.attackCooldown = 1000 / atkSpd;
      t.isAttacking = true;

      targets.forEach(target => {
        // 치명타
        let rawDamage = atkDmg;
        let isCrit = false;
        if (t.critChance > 0 && Math.random() * 100 < t.critChance) {
          rawDamage *= 2;
          isCrit = true;
        }

        // 흡혈
        if (t.lifeSteal > 0) {
          healing += rawDamage * (t.lifeSteal / 100);
        }

        // 적 피해 + 상태이상 적용
        updatedEnemies = updatedEnemies.map(e => {
          if (e.id !== target.id) return e;

          let damaged = damageEnemy(e, rawDamage);
          if (damaged.isDead) return damaged;

          // 둔화
          if (t.slowEffect > 0) damaged = slowEnemy(damaged, t.slowEffect);

          // 빙결
          if (t.freezeChance > 0 && Math.random() * 100 < t.freezeChance) {
            damaged = freezeEnemy(damaged, 1000);
          }

          // 독 도포
          if (t.poisonDamage > 0) {
            const durMult = synergy.poisonDurationMult || 1;
            const dmgMult = (damaged.isFrozen && synergy.frozenPoisonMult) ? synergy.frozenPoisonMult : 1;
            damaged = poisonEnemy(damaged, t.poisonDamage * dmgMult, 3000, durMult);
          }

          return damaged;
        });

        // 연쇄 공격 (처치된 적 주변에 추가 피해)
        if (t.chainDamage > 0) {
          const killed = updatedEnemies.find(e => e.id === target.id && e.isDead);
          if (killed) {
            const chainDmg = rawDamage * (t.chainDamage / 100);
            updatedEnemies = updatedEnemies.map(e => {
              if (!e.isDead && e.id !== target.id) {
                if (distance(e.x, e.y, target.x, target.y) < 60) {
                  return damageEnemy(e, chainDmg, true);
                }
              }
              return e;
            });
          }
        }

        // 공격 이펙트
        const color = isCrit ? '#ffaa00' : t.hasSniper ? '#ff6600' : '#00ffff';
        effects.push(createAttackEffect(t.x, t.y, target.x, target.y, color));
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
  let regenMult = 1;
  // 투지 시너지: HP 30% 이하 시 ×3
  if (tower.hasLastStand && tower.health / tower.maxHealth <= 0.3) {
    regenMult = 3;
  }
  const regenAmount = tower.healthRegen * regenMult * (deltaTime / 1000);
  return {
    ...tower,
    health: Math.min(tower.maxHealth, tower.health + regenAmount),
  };
}

/**
 * 타워가 피해를 받음
 */
export function towerTakeDamage(tower, enemy) {
  const synergy = tower.synergyBonuses || {};
  const rawDamage = enemy.damage;

  // 시너지: 철벽 — 5% 확률 피해 무효화
  if (synergy.damageNullify && Math.random() * 100 < synergy.damageNullify) {
    return { tower, actualDamage: 0, thornDamageToEnemy: 0 };
  }

  // 요새 분기: 추가 50% 피해 감소
  let defensePercent = tower.defense;
  if (tower.hasFortress) defensePercent = Math.min(95, defensePercent + 50);

  // 기동방패 분기: 회피 20%
  if (tower.hasAgile && Math.random() * 100 < 20) {
    return { tower, actualDamage: 0, thornDamageToEnemy: 0 };
  }

  const actualDamage = calculateDamage(rawDamage, defensePercent, tower.absoluteDefense);
  let newHealth = tower.health - actualDamage;

  // 가시 피해 (% 반사)
  let thornDamageToEnemy = 0;
  if (tower.thornPercent > 0) {
    thornDamageToEnemy = rawDamage * (tower.thornPercent / 100);
    // 피의 복수 시너지: 반사 피해로 흡혈 발동
    if (synergy.thornLifesteal) {
      newHealth = Math.min(tower.maxHealth, newHealth + thornDamageToEnemy * (tower.lifeSteal / 100));
    }
  }
  // 기존 thornDamage (고정 반사) 호환
  if (tower.thornDamage > 0) {
    thornDamageToEnemy = Math.max(thornDamageToEnemy, tower.thornDamage);
  }

  return {
    tower: { ...tower, health: Math.max(0, newHealth) },
    actualDamage,
    thornDamageToEnemy,
  };
}

/**
 * 업그레이드 적용 (v2)
 */
export function applyUpgrade(tower, upgrade) {
  const { statKey, increment } = upgrade;

  // 분기/특수 업그레이드 처리
  if (upgrade.isSpecial) {
    switch (upgrade.id) {
      case 'sniper':
        return { ...tower, hasSniper: true };
      case 'gatling':
        return { ...tower, hasGatling: true };
      case 'fortress':
        return {
          ...tower,
          hasFortress: true,
          maxHealth: tower.maxHealth + 100,
          health: Math.min(tower.maxHealth + 100, tower.health + 100),
        };
      case 'agile':
        return { ...tower, hasAgile: true, defense: tower.defense + 25 };
      case 'last_stand':
        return { ...tower, hasLastStand: true };
      case 'economy':
        return { ...tower, hasEconomy: true };
      case 'support':
        return { ...tower, hasSupport: true };
      default:
        return tower;
    }
  }

  // 일반 스탯 업그레이드
  let updatedTower = {
    ...tower,
    [statKey]: (tower[statKey] || 0) + increment,
  };

  // 최대 체력 증가 시 현재 체력도 같이 증가
  if (statKey === 'maxHealth') {
    updatedTower.health = Math.min(updatedTower.maxHealth, updatedTower.health + increment);
  }

  return updatedTower;
}

/**
 * 타워 생존 여부
 */
export function isTowerAlive(tower) {
  return tower.health > 0;
}
