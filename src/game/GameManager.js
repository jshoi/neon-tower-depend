import { GAME_CONFIG } from '../config/gameConfig';
import { calculateUpgradeCost, isUpgradeUnlocked, isBranchBlocked, calcSynergyBonuses } from '../config/upgradeConfig';
import { createTowerState, processTowerAttack, regenerateHealth, applyUpgrade, isTowerAlive } from './TowerSystem';
import { updateEnemies, removeDeadEnemies } from './EnemySystem';
import { createWaveSystem, updateWaveSystem, onEnemyKilled, onEnemiesSpawned, WAVE_STATE } from './WaveSystem';
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

export function createInitialGameState() {
  return {
    gameState: GAME_STATE.PLAYING,
    tower: createTowerState(),
    enemies: [],
    waveSystem: createWaveSystem(),
    money: GAME_CONFIG.game.startingMoney,
    score: 0,
    upgrades: {},
    coinBonusPercent: 0,   // 글로벌 코인 보너스 %
    waveBonusPercent: 0,   // 글로벌 웨이브 클리어 보너스 %
    hasEconomy: false,     // 경제 타워 업그레이드 보유 여부

    particles: [],
    textAnimations: [],
    attackEffects: [],

    lastTime: null,
  };
}

export function updateGameState(state, timestamp) {
  if (state.gameState !== GAME_STATE.PLAYING) return state;

  const lastTime = state.lastTime || timestamp;
  const deltaTime = Math.min(timestamp - lastTime, 50);

  let s = { ...state, lastTime: timestamp };

  // 시너지 계산 후 타워에 주입
  const synergyBonuses = calcSynergyBonuses(s.upgrades);
  s.tower = { ...s.tower, synergyBonuses };

  // 1. 웨이브 시스템 업데이트
  const prevWaveState = s.waveSystem.state;
  const { waveSystem: newWS, newEnemies } = updateWaveSystem(s.waveSystem, s.enemies, deltaTime);
  s.waveSystem = newWS;

  // 웨이브 클리어 감지 (FIGHTING → BREAK 전환)
  if (prevWaveState === WAVE_STATE.FIGHTING && newWS.state === WAVE_STATE.BREAK) {
    const waveReward = calcWaveReward(s);
    if (waveReward > 0) {
      s.money += waveReward;
      s.score += waveReward;
      s.textAnimations = [
        ...s.textAnimations,
        createCoinText(GAME_CONFIG.canvas.width / 2, GAME_CONFIG.canvas.height / 2 - 60, waveReward),
      ];
    }
    // 경제 타워: 매 웨이브마다 코인 +100
    if (s.hasEconomy) {
      s.money += 100;
    }
  }

  // 새 적 추가
  if (newEnemies.length > 0) {
    s.enemies = [...s.enemies, ...newEnemies];
  }

  // 2. 적 이동/상태 업데이트
  s.enemies = updateEnemies(s.enemies, s.tower.x, s.tower.y, deltaTime);

  // 3. 타워 공격 처리
  const { tower: attackedTower, enemies: afterAttackEnemies, effects, healing } =
    processTowerAttack(s.tower, s.enemies, deltaTime);
  s.tower = attackedTower;
  s.enemies = afterAttackEnemies;
  s.attackEffects = [...s.attackEffects, ...effects];

  if (healing > 0) {
    s.tower = { ...s.tower, health: Math.min(s.tower.maxHealth, s.tower.health + healing) };
  }

  // 4. 충돌 처리
  const { tower: collidedTower, enemies: afterCollisionEnemies, events, rewards: collisionRewards } =
    processCollisions(s.tower, s.enemies, deltaTime);
  s.tower = collidedTower;
  s.enemies = afterCollisionEnemies;

  events.forEach(event => {
    if (event.type === 'tower_hit') {
      s.particles = [...s.particles, ...createParticles(event.x, event.y, '#ff4444', 4)];
    }
  });

  // 가시 반사로 처치된 적 보상
  if (collisionRewards.length > 0) {
    collisionRewards.forEach(r => {
      const totalReward = calcKillReward(r.amount, s);
      s.money += totalReward;
      s.score += totalReward;
      s.textAnimations = [...s.textAnimations, createCoinText(r.x, r.y, totalReward)];
      s.particles = [...s.particles, ...createParticles(r.x, r.y, '#ffd700', 6)];
    });
  }

  // 5. 죽은 적 처리 (분열/보스 사망 스폰 포함)
  const { alive, rewards, spawned } = removeDeadEnemies(s.enemies, s.waveSystem.currentWave);

  rewards.forEach(reward => {
    const totalReward = calcKillReward(reward.amount, s);
    s.money += totalReward;
    s.score += totalReward;
    s.waveSystem = onEnemyKilled(s.waveSystem);
    s.textAnimations = [...s.textAnimations, createCoinText(reward.x, reward.y, totalReward)];
    s.particles = [...s.particles, ...createParticles(reward.x, reward.y, '#ffd700', 8)];
    s.particles = [...s.particles, ...createParticles(reward.x, reward.y, '#ff0080', 4)];
  });

  s.enemies = alive;

  // 분열/보스 사망으로 생성된 새 적 추가
  if (spawned.length > 0) {
    s.enemies = [...s.enemies, ...spawned];
    s.waveSystem = onEnemiesSpawned(s.waveSystem, spawned.length);
    spawned.forEach(e => {
      s.particles = [...s.particles, ...createParticles(e.x, e.y, '#ff00ff', 5)];
    });
  }

  // 6. 체력 재생
  s.tower = regenerateHealth(s.tower, deltaTime);

  // 7. 비주얼 업데이트
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
 * 킬 보상 계산 (글로벌 코인 보너스 반영)
 */
function calcKillReward(baseAmount, state) {
  const bonusMult = 1 + (state.coinBonusPercent || 0) / 100;
  // 시너지: 전략가
  const synergyBonus = (state.tower.synergyBonuses?.coinBonusFlat || 0);
  return Math.floor(baseAmount * bonusMult) + Math.floor(synergyBonus / 10);
}

/**
 * 웨이브 클리어 보상 계산
 */
function calcWaveReward(state) {
  const baseReward = 20 + state.waveSystem.currentWave * 5;
  const bonusMult = 1 + (state.waveBonusPercent || 0) / 100;
  return Math.floor(baseReward * bonusMult);
}

/**
 * 업그레이드 구매
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

  // 잠금 해제 확인
  const upgradeWithCat = { ...upgrade, category: upgrade.category };
  if (!isUpgradeUnlocked(upgradeWithCat, state.upgrades, state.waveSystem.currentWave)) {
    return { success: false, newState: state, message: '잠금 해제 조건 미충족' };
  }

  // 분기 충돌 확인
  if (isBranchBlocked(upgradeWithCat, state.upgrades)) {
    return { success: false, newState: state, message: '이미 다른 분기를 선택했습니다!' };
  }

  const newUpgrades = { ...state.upgrades, [upgrade.id]: currentLevel + 1 };
  let newTower = applyUpgrade(state.tower, upgrade);

  // 글로벌 업그레이드 처리
  let newCoinBonusPercent = state.coinBonusPercent;
  let newWaveBonusPercent = state.waveBonusPercent;
  let newHasEconomy = state.hasEconomy;

  if (upgrade.statKey === 'coinBonusPercent') {
    newCoinBonusPercent += upgrade.increment;
    newTower = state.tower; // 타워에 직접 적용 안 함
  }
  if (upgrade.statKey === 'waveBonus') {
    newWaveBonusPercent += upgrade.increment;
    newTower = { ...newTower, waveBonus: (newTower.waveBonus || 0) + upgrade.increment };
  }
  if (upgrade.id === 'economy') {
    newHasEconomy = true;
    newTower = state.tower; // 타워에 직접 적용 안 함
  }

  // 시너지 재계산 후 타워에 주입
  const synergyBonuses = calcSynergyBonuses(newUpgrades);
  newTower = { ...newTower, synergyBonuses };

  return {
    success: true,
    newState: {
      ...state,
      money: state.money - cost,
      upgrades: newUpgrades,
      tower: newTower,
      coinBonusPercent: newCoinBonusPercent,
      waveBonusPercent: newWaveBonusPercent,
      hasEconomy: newHasEconomy,
    },
    message: `${upgrade.name} 업그레이드!`,
  };
}

export function restartGame() {
  return createInitialGameState();
}

export function togglePause(state) {
  if (state.gameState === GAME_STATE.PLAYING) {
    return { ...state, gameState: GAME_STATE.PAUSED };
  } else if (state.gameState === GAME_STATE.PAUSED) {
    return { ...state, gameState: GAME_STATE.PLAYING, lastTime: null };
  }
  return state;
}
