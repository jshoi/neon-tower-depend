import { GAME_CONFIG } from '../config/gameConfig';
import { createEnemy } from './EnemySystem';

export const WAVE_STATE = {
  WAITING: 'waiting',
  SPAWNING: 'spawning',
  FIGHTING: 'fighting',
  BREAK: 'break',
};

// 처음 등장하는 적 유형 웨이브 매핑 (알림용)
const FIRST_APPEARANCE = {
  4:  'SPEEDER',
  7:  'TANK',
  10: 'SPLITTER',
  13: 'REGEN',
  16: 'GHOST',
  3:  'BOSS',
};

const TYPE_LABELS = {
  SPEEDER:  { label: '돌진형 SPEEDER', desc: '빠르지만 약합니다. 빠르게 처치하세요!' },
  TANK:     { label: '탱커형 TANK',    desc: '느리지만 방어력이 높습니다.' },
  SPLITTER: { label: '분열형 SPLITTER', desc: '처치하면 2마리로 분열합니다!' },
  REGEN:    { label: '재생형 REGEN',   desc: 'HP를 스스로 재생합니다. 빠르게 처치!' },
  GHOST:    { label: '유령형 GHOST',   desc: '공격을 회피하고 주기적으로 무적이 됩니다.' },
  BOSS:     { label: '보스 등장!',     desc: 'HP 50% 이하 시 분노합니다. 조심하세요!' },
};

/**
 * 초기 웨이브 시스템 상태
 */
export function createWaveSystem() {
  return {
    currentWave: 0,
    state: WAVE_STATE.WAITING,
    spawnQueue: [],         // 스폰 대기 큐 [{type, count}]
    spawnTimer: 0,
    breakTimer: 0,
    totalKills: 0,
    enemiesAlive: 0,
    newTypeNotice: null,    // { label, desc } 신규 유형 알림
    noticeTimer: 0,
  };
}

/**
 * 웨이브별 적 구성 큐 생성
 */
export function buildSpawnQueue(wave) {
  const composition = GAME_CONFIG.waveComposition[wave];
  if (composition) {
    // 하드코딩된 구성 사용
    return composition.map(c => ({ type: c.type, count: c.count }));
  }
  // W19+ 동적 생성
  return buildDynamicQueue(wave);
}

function buildDynamicQueue(wave) {
  const queue = [];
  const isOdd = wave % 2 !== 0;
  const isBossWave = wave % 3 === 0;

  // 기본 배분 (홀수: 속도형 강조, 짝수: 내구도형 강조)
  const baseCount = Math.floor(3 + wave * 0.5);

  if (isOdd) {
    queue.push({ type: 'SPEEDER', count: Math.floor(baseCount * 0.35) });
    queue.push({ type: 'GHOST',   count: Math.floor(baseCount * 0.25) });
    queue.push({ type: 'BASIC',   count: Math.floor(baseCount * 0.20) });
    queue.push({ type: 'REGEN',   count: Math.floor(baseCount * 0.10) });
    queue.push({ type: 'TANK',    count: Math.floor(baseCount * 0.10) });
  } else {
    queue.push({ type: 'TANK',     count: Math.floor(baseCount * 0.30) });
    queue.push({ type: 'REGEN',    count: Math.floor(baseCount * 0.25) });
    queue.push({ type: 'SPLITTER', count: Math.floor(baseCount * 0.20) });
    queue.push({ type: 'BASIC',    count: Math.floor(baseCount * 0.15) });
    queue.push({ type: 'SPEEDER',  count: Math.floor(baseCount * 0.10) });
  }

  if (isBossWave) {
    queue.push({ type: 'BOSS', count: 1 });
  }

  return queue.filter(q => q.count > 0);
}

/**
 * 웨이브 시스템 업데이트
 */
export function updateWaveSystem(waveSystem, currentEnemies, deltaTime) {
  let ws = { ...waveSystem };
  const newEnemies = [];

  // 알림 타이머
  if (ws.noticeTimer > 0) {
    ws.noticeTimer = Math.max(0, ws.noticeTimer - deltaTime);
    if (ws.noticeTimer <= 0) ws.newTypeNotice = null;
  }

  switch (ws.state) {
    case WAVE_STATE.WAITING:
      ws.breakTimer += deltaTime;
      if (ws.breakTimer >= 2000) {
        ws = startNextWave(ws);
      }
      break;

    case WAVE_STATE.SPAWNING: {
      ws.spawnTimer -= deltaTime;

      if (ws.spawnTimer <= 0) {
        // 큐에서 다음 적 스폰
        let spawned = false;
        while (ws.spawnQueue.length > 0 && !spawned) {
          const first = ws.spawnQueue[0];
          if (first.count <= 0) {
            ws.spawnQueue = ws.spawnQueue.slice(1);
            continue;
          }
          newEnemies.push(createEnemy(ws.currentWave, first.type));
          ws.spawnQueue = [
            { ...first, count: first.count - 1 },
            ...ws.spawnQueue.slice(1),
          ];
          ws.enemiesAlive++;
          ws.spawnTimer = GAME_CONFIG.wave.spawnInterval;
          spawned = true;
        }

        if (ws.spawnQueue.length === 0 || ws.spawnQueue.every(q => q.count <= 0)) {
          ws.spawnQueue = [];
          ws.state = WAVE_STATE.FIGHTING;
        }
      }
      break;
    }

    case WAVE_STATE.FIGHTING:
      if (currentEnemies.length === 0) {
        ws.state = WAVE_STATE.BREAK;
        ws.breakTimer = 0;
      }
      break;

    case WAVE_STATE.BREAK:
      ws.breakTimer += deltaTime;
      if (ws.breakTimer >= GAME_CONFIG.wave.waveBreakDuration) {
        ws = startNextWave(ws);
      }
      break;

    default:
      break;
  }

  return { waveSystem: ws, newEnemies };
}

/**
 * 다음 웨이브 시작
 */
function startNextWave(ws) {
  const nextWave = ws.currentWave + 1;
  const spawnQueue = buildSpawnQueue(nextWave);

  // 신규 유형 등장 알림
  let newTypeNotice = null;
  const noticeType = FIRST_APPEARANCE[nextWave];
  if (noticeType && TYPE_LABELS[noticeType]) {
    newTypeNotice = TYPE_LABELS[noticeType];
  }

  return {
    ...ws,
    currentWave: nextWave,
    state: WAVE_STATE.SPAWNING,
    spawnQueue,
    enemiesAlive: 0,
    spawnTimer: 500,
    breakTimer: 0,
    newTypeNotice,
    noticeTimer: newTypeNotice ? 3000 : 0,
  };
}

/**
 * 적 처치 카운터
 */
export function onEnemyKilled(waveSystem, count = 1) {
  return {
    ...waveSystem,
    totalKills: waveSystem.totalKills + count,
    enemiesAlive: Math.max(0, waveSystem.enemiesAlive - count),
  };
}

/**
 * 분열/보스 사망으로 추가 스폰된 적 수 반영
 */
export function onEnemiesSpawned(waveSystem, count) {
  return {
    ...waveSystem,
    enemiesAlive: waveSystem.enemiesAlive + count,
  };
}

/**
 * 웨이브 브레이크 남은 시간 (초)
 */
export function getBreakTimeRemaining(waveSystem) {
  if (waveSystem.state !== WAVE_STATE.BREAK) return 0;
  return Math.ceil((GAME_CONFIG.wave.waveBreakDuration - waveSystem.breakTimer) / 1000);
}
