import { GAME_CONFIG } from '../config/gameConfig';
import { calculateUpgradeCost } from '../config/upgradeConfig';
import { createTowerState, processTowerAttack, regenerateHealth, applyUpgrade, isTowerAlive } from './TowerSystem';
import { updateEnemies, removeDeadEnemies } from './EnemySystem';
import { createWaveSystem, updateWaveSystem, onEnemyKilled } from './WaveSystem';
import { processCollisions } from './CollisionSystem';
import {
  createParticles,
  updateParticles,
  createCoinText,
  updateTextAnimations,
  updateAttackEffects,
} from '../utils/animationUtils';

export const GAME_STATE = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
  PAUSED: 'paused',
};

/**
 * 초기 게임 상태 생성
 */
export function createInitialGameState() {
  return {
    gameState: GAME_STATE.PLAYING,
    tower: createTowerState(),
    enemies: [],
    waveSystem: createWaveSystem(),
    money: GAME_CONFIG.game.startingMoney,
    score: 0,
    upgrades: {},          // { upgradeId: currentLevel }
    coinBonus: 0,          // 글로벌 코인 보너스

    // 비주얼 이펙트
    particles: [],
    textAnimations: [],
    attackEffects: [],

    lastTime: null,
  };
}

/**
 * 메인 게임 루프 업데이트
 * Returns: 새로운 게임 상태
 */
export function updateGameState(state, timestamp) {
  if (state.gameState !== GAME_STATE.PLAYING) return state;

  const lastTime = state.lastTime || timestamp;
  const deltaTime = Math.min(timestamp - lastTime, 50); // 최대 50ms (탭 전환 등 방지)

  let s = { ...state, lastTime: timestamp };

  // 1. 웨이브 시스템 업데이트
  const { waveSystem: newWS, newEnemies } = updateWaveSystem(
    s.waveSystem,
    s.enemies,
    deltaTime
  );
  s.waveSystem = newWS;

  // 새 적 추가
  if (newEnemies.length > 0) {
    s.enemies = [...s.enemies, ...newEnemies];
  }

  // 2. 적 이동 업데이트
  s.enemies = updateEnemies(s.enemies, s.tower.x, s.tower.y, deltaTime);

  // 3. 타워 공격 처리
  const { tower: attackedTower, enemies: afterAttackEnemies, effects, healing } =
    processTowerAttack(s.tower, s.enemies, deltaTime);
  s.tower = attackedTower;
  s.enemies = afterAttackEnemies;
  s.attackEffects = [...s.attackEffects, ...effects];

  // 흡혈 회복
  if (healing > 0) {
    s.tower = {
      ...s.tower,
      health: Math.min(s.tower.maxHealth, s.tower.health + healing),
    };
  }

  // 4. 충돌 처리 (적의 타워 공격)
  const { tower: collidedTower, enemies: afterCollisionEnemies, events, rewards: collisionRewards } =
    processCollisions(s.tower, s.enemies, deltaTime);
  s.tower = collidedTower;
  s.enemies = afterCollisionEnemies;

  // 충돌 이벤트 처리
  events.forEach(event => {
    if (event.type === 'tower_hit') {
      s.particles = [...s.particles, ...createParticles(event.x, event.y, '#ff4444', 4)];
    }
  });

  // 가시 피해로 죽은 적 보상 처리
  if (collisionRewards.length > 0) {
    collisionRewards.forEach(r => {
      const totalReward = r.amount + s.coinBonus;
      s.money += totalReward;
      s.score += totalReward;
      s.textAnimations = [...s.textAnimations, createCoinText(r.x, r.y, totalReward)];
      s.particles = [...s.particles, ...createParticles(r.x, r.y, '#ffd700', 6)];
    });
  }

  // 5. 죽은 적 처리
  const { alive, rewards } = removeDeadEnemies(s.enemies);

  rewards.forEach(reward => {
    const totalReward = reward.amount + s.coinBonus;
    s.money += totalReward;
    s.score += totalReward;
    s.waveSystem = onEnemyKilled(s.waveSystem);
    s.textAnimations = [...s.textAnimations, createCoinText(reward.x, reward.y, totalReward)];
    s.particles = [...s.particles, ...createParticles(reward.x, reward.y, '#ffd700', 8)];
    s.particles = [...s.particles, ...createParticles(reward.x, reward.y, '#ff0080', 4)];
  });

  s.enemies = alive;

  // 6. 체력 재생
  s.tower = regenerateHealth(s.tower, deltaTime);

  // 7. 비주얼 이펙트 업데이트
  s.particles = updateParticles(s.particles);
  s.textAnimations = updateTextAnimations(s.textAnimations);
  s.attackEffects = updateAttackEffects(s.attackEffects);

  // 8. 게임 오버 체크
  if (!isTowerAlive(s.tower)) {
    s.gameState = GAME_STATE.GAME_OVER;
  }

  return s;
}

/**
 * 업그레이드 구매
 * Returns: { success, newState, message }
 */
export function purchaseUpgrade(state, upgrade) {
  const currentLevel = state.upgrades[upgrade.id] || 0;
  const upgradeWithLevel = { ...upgrade, currentLevel };
  const cost = calculateUpgradeCost(upgradeWithLevel);

  if (state.money < cost) {
    return { success: false, newState: state, message: '코인이 부족합니다!' };
  }

  if (upgrade.maxLevel && currentLevel >= upgrade.maxLevel) {
    return { success: false, newState: state, message: '최대 레벨입니다!' };
  }

  const newUpgrades = {
    ...state.upgrades,
    [upgrade.id]: currentLevel + 1,
  };

  let newTower = applyUpgrade(state.tower, upgrade);

  // 글로벌 업그레이드 처리 (코인 보너스 등)
  let newCoinBonus = state.coinBonus;
  if (upgrade.statKey === 'coinBonus') {
    newCoinBonus += upgrade.increment;
    // 타워에도 적용하지 않음 (글로벌)
    newTower = state.tower;
  }

  return {
    success: true,
    newState: {
      ...state,
      money: state.money - cost,
      upgrades: newUpgrades,
      tower: newTower,
      coinBonus: newCoinBonus,
    },
    message: `${upgrade.name} 업그레이드!`,
  };
}

/**
 * 게임 재시작
 */
export function restartGame() {
  return createInitialGameState();
}

/**
 * 게임 일시정지 토글
 */
export function togglePause(state) {
  if (state.gameState === GAME_STATE.PLAYING) {
    return { ...state, gameState: GAME_STATE.PAUSED };
  } else if (state.gameState === GAME_STATE.PAUSED) {
    return { ...state, gameState: GAME_STATE.PLAYING, lastTime: null };
  }
  return state;
}
