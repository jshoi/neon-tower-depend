# [FEATURE SPEC] 3웨이브 단위 적 다양화
우선순위: HIGH | 복잡도: 보통(~4h) | 기획일: 2026-03-14

## 개요
현재 단일 적 유형(BASIC)에서 6종 + BOSS로 확장.
3웨이브마다 새 유형 첫 등장, 전 유형이 점진적으로 조합되어 전략 깊이 증가.

## 구현 범위

### 수정 파일
- `src/config/gameConfig.js` — 적 유형별 스탯 추가
- `src/game/EnemySystem.js` — 유형별 생성/특수능력 로직
- `src/game/WaveSystem.js` — 웨이브별 적 구성 테이블
- `src/game/CollisionSystem.js` — TANK 피해감소, GHOST 회피 처리
- `src/game/TowerSystem.js` — REGEN 적 처리 (공격 후 재생 중단 여부)
- `src/components/Enemy.jsx` — 유형별 렌더링 (모양, 색상, 특수 이펙트)

## 적 유형 스탯 정의

### BASIC (기존, 변경 없음)
- 모양: 18×18 사각형
- 색상: 흰색 #FFFFFF + 시안 테두리 #00FFFF
- speed: 1.5, hp: wave×15, damage: 1
- 특수능력: 없음
- 등장: 웨이브 1~

### SPEEDER (돌진형)
- 모양: 12×12 다이아몬드(회전된 사각형 45도)
- 색상: 노란색 #FFD700 + 주황 테두리 #FF8C00
- 이동 trail: 이전 3프레임 위치에 globalAlpha 0.2로 잔상 렌더링
- speed: 3.0, hp: wave×8, damage: 1
- 특수능력: 타워 반경 80px 이내 시 speed×1.5 돌진
- 등장: 웨이브 4~

### TANK (탱커형)
- 모양: 26×26 육각형 (6각형 path)
- 색상: 회색 #808080 + 파랑 테두리 #4169E1 (두께 3px)
- speed: 0.7, hp: wave×60, damage: 3, armor: 0.3
- 특수능력: 모든 받는 피해 × (1 - armor) = × 0.7
- 등장: 웨이브 7~

### SPLITTER (분열형)
- 모양: 22×22 팔각형
- 색상: 보라색 #9B59B6 + 마젠타 테두리 #FF00FF
- HP 50% 이하 시 테두리 깜빡임 (blink 0.5초 주기)
- speed: 1.2, hp: wave×25, damage: 2
- 특수능력: 처치 시 BASIC 2마리 생성 (hp = 현재 웨이브 BASIC 기본 HP의 50%)
- 등장: 웨이브 10~

### REGEN (재생형)
- 모양: 20×20 원형 (arc)
- 색상: 초록색 #2ECC71 + 라임 테두리 #ADFF2F
- 외곽에 회전하는 초록 점 3개 (애니메이션)
- speed: 1.0, hp: wave×20, damage: 2, regenRate: 15hp/s
- 특수능력: 매 틱 hp += regenRate × deltaTime/1000 (maxHp 초과 불가)
- 등장: 웨이브 13~

### GHOST (유령형)
- 모양: 16×16 원형
- 색상: 하늘색 #87CEEB + 시안 글로우 (shadowBlur: 15)
- globalAlpha: 0.5 + 0.2×sin(time/200) 으로 명멸
- speed: 2.0, hp: wave×12, damage: 1
- 특수능력1: evasion 30% (공격 받을 때 30% 확률 피해 0)
- 특수능력2: 매 6초마다 0.5초 완전 무적 (invincibleTimer)
- 등장: 웨이브 16~

### BOSS (보스형)
- 모양: 40×40 별형 (5각 star path, 10점)
- 색상: 빨간색 #FF0000 + 주황 테두리 #FF6600
- 외곽 펄싱 글로우 (shadowBlur: 10+5×sin(time/300))
- 등장 애니메이션: scale 0→1 300ms
- speed: 0.5, hp: wave×200, damage: 5
- 특수능력1: HP 50% 이하 시 speed × 1.5 (분노 상태)
- 특수능력2: 처치 시 SPEEDER 3마리 생성
- 등장: 3의 배수 웨이브 (wave % 3 === 0)

## 웨이브 구성 테이블

```
웨이브 → 구성 (유형:수)
W1:  BASIC:5
W2:  BASIC:8
W3:  BASIC:10 + BOSS:1
W4:  BASIC:8  + SPEEDER:3
W5:  BASIC:6  + SPEEDER:6
W6:  BASIC:4  + SPEEDER:8  + BOSS:1
W7:  BASIC:6  + SPEEDER:4  + TANK:2
W8:  BASIC:4  + SPEEDER:6  + TANK:3
W9:  BASIC:4  + SPEEDER:4  + TANK:4  + BOSS:1
W10: BASIC:4  + SPEEDER:4  + TANK:2  + SPLITTER:4
W11: BASIC:4  + SPLITTER:6 + SPEEDER:4 + TANK:2
W12: BASIC:4  + SPLITTER:6 + TANK:3  + BOSS:1
W13: BASIC:4  + SPLITTER:4 + REGEN:3  + TANK:2
W14: BASIC:4  + REGEN:5   + SPEEDER:4 + TANK:2
W15: 전 유형 혼합           + BOSS:1
W16: BASIC:4  + REGEN:4   + GHOST:4
W17: GHOST:6  + TANK:2    + SPLITTER:3 + REGEN:2
W18: 전 유형 혼합           + BOSS:1
W19+: getWaveComposition(wave) 함수로 동적 생성
```

### W19+ 동적 구성 공식
```js
function getWaveComposition(wave) {
  const isBossWave = wave % 3 === 0;
  const baseCount = 5 + wave * 2;
  const types = ['BASIC','SPEEDER','TANK','SPLITTER','REGEN','GHOST'];
  const availableTypes = types.filter(t => isTypeUnlocked(t, wave));
  // 홀수 웨이브: 속도형(SPEEDER, GHOST) 비중 높임
  // 짝수 웨이브: 내구도형(TANK, REGEN) 비중 높임
  // 3의 배수: BOSS 1마리 + 소수 혼합
}
```

## 적 등장 첫 웨이브 안내 UI
새 유형 첫 등장 시 화면 중앙 하단에 2초간 팝업:
```
┌──────────────────────┐
│  [아이콘] 새로운 적!   │
│  돌진형 SPEEDER       │
│  빠르지만 약합니다    │
└──────────────────────┘
```

## 제외 범위
- 비행형 적 (이동 경로 분리 필요 → 다음 버전)
- 분열형의 연쇄 분열 (SPLITTER→SPLITTER)
- 적 간 힐링 (치유 적)
- 웨이브 예고 UI (별도 기능으로 분리)
