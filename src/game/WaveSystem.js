import { GAME_CONFIG } from '../config/gameConfig';
import { createEnemy } from './EnemySystem';

export const WAVE_STATE = {
  WAITING: 'waiting',     // 웨이브 시작 전 대기
  SPAWNING: 'spawning',   // 적 스폰 중
  FIGHTING: 'fighting',   // 전투 중 (스폰 완료)
  BREAK: 'break',         // 웨이브 클리어 후 휴식
};

/**
 * 초기 웨이브 시스템 상태
 */
export function createWaveSystem() {
  return {
    currentWave: 0,
    state: WAVE_STATE.WAITING,
    enemiesRemaining: 0,    // 이번 웨이브에서 스폰할 적 수
    enemiesAlive: 0,        // 현재 살아있는 적 수
    spawnTimer: 0,          // 다음 스폰까지 남은 시간
    breakTimer: 0,          // 휴식 타이머
    totalKills: 0,
  };
}

/**
 * 웨이브에서 생성할 적 수 계산
 */
export function getEnemyCount(wave) {
  const { initialEnemies, enemyIncreasePerWave } = GAME_CONFIG.wave;
  return initialEnemies + (wave - 1) * enemyIncreasePerWave;
}

/**
 * 웨이브 시스템 업데이트
 * Returns: { waveSystem, newEnemies, waveCleared, waveStarted }
 */
export function updateWaveSystem(waveSystem, currentEnemies, deltaTime) {
  let ws = { ...waveSystem };
  const newEnemies = [];
  let waveCleared = false;
  let waveStarted = false;

  switch (ws.state) {
    case WAVE_STATE.WAITING:
      // 자동으로 첫 웨이브 시작 (약간의 딜레이 후)
      ws.breakTimer += deltaTime;
      if (ws.breakTimer >= 2000) {
        ws = startNextWave(ws);
        waveStarted = true;
      }
      break;

    case WAVE_STATE.SPAWNING: {
      ws.spawnTimer -= deltaTime;
      if (ws.spawnTimer <= 0 && ws.enemiesRemaining > 0) {
        // 새 적 스폰
        newEnemies.push(createEnemy(ws.currentWave));
        ws.enemiesRemaining--;
        ws.enemiesAlive++;
        ws.spawnTimer = GAME_CONFIG.wave.spawnInterval;

        // 모든 적 스폰 완료
        if (ws.enemiesRemaining === 0) {
          ws.state = WAVE_STATE.FIGHTING;
        }
      }
      break;
    }

    case WAVE_STATE.FIGHTING:
      // 모든 적이 죽었는지 확인
      if (currentEnemies.length === 0 && ws.enemiesAlive > 0) {
        ws.enemiesAlive = 0;
      }
      if (currentEnemies.length === 0 && ws.enemiesRemaining === 0) {
        ws.state = WAVE_STATE.BREAK;
        ws.breakTimer = 0;
        waveCleared = true;
      }
      break;

    case WAVE_STATE.BREAK:
      ws.breakTimer += deltaTime;
      if (ws.breakTimer >= GAME_CONFIG.wave.waveBreakDuration) {
        ws = startNextWave(ws);
        waveStarted = true;
      }
      break;

    default:
      break;
  }

  return { waveSystem: ws, newEnemies, waveCleared, waveStarted };
}

/**
 * 다음 웨이브 시작
 */
function startNextWave(ws) {
  const nextWave = ws.currentWave + 1;
  return {
    ...ws,
    currentWave: nextWave,
    state: WAVE_STATE.SPAWNING,
    enemiesRemaining: getEnemyCount(nextWave),
    enemiesAlive: 0,
    spawnTimer: 500, // 첫 스폰 딜레이
    breakTimer: 0,
  };
}

/**
 * 적 처치 시 카운터 업데이트
 */
export function onEnemyKilled(waveSystem) {
  return {
    ...waveSystem,
    totalKills: waveSystem.totalKills + 1,
    enemiesAlive: Math.max(0, waveSystem.enemiesAlive - 1),
  };
}

/**
 * 웨이브 클리어까지 남은 시간 (초, BREAK 상태일 때)
 */
export function getBreakTimeRemaining(waveSystem) {
  if (waveSystem.state !== WAVE_STATE.BREAK) return 0;
  return Math.ceil(
    (GAME_CONFIG.wave.waveBreakDuration - waveSystem.breakTimer) / 1000
  );
}
