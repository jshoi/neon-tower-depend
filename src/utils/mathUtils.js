/**
 * 두 점 사이의 거리 계산
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 두 점 사이의 각도 계산 (라디안)
 */
export function angleBetween(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * 값을 min~max 범위로 클램프
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 두 숫자 사이의 선형 보간
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 랜덤 정수 (min 포함, max 포함)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 랜덤 부동소수 (min 포함, max 미포함)
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 육각형의 꼭짓점 좌표 배열 반환
 */
export function hexagonPoints(cx, cy, size) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return points;
}

/**
 * 스폰 위치 계산 (캔버스 가장자리 중 랜덤 위치)
 */
export function getSpawnPosition(canvasWidth, canvasHeight, margin = 30) {
  const side = randomInt(0, 3);
  switch (side) {
    case 0: // 위
      return { x: randomFloat(margin, canvasWidth - margin), y: -margin };
    case 1: // 아래
      return { x: randomFloat(margin, canvasWidth - margin), y: canvasHeight + margin };
    case 2: // 왼쪽
      return { x: -margin, y: randomFloat(margin, canvasHeight - margin) };
    case 3: // 오른쪽
      return { x: canvasWidth + margin, y: randomFloat(margin, canvasHeight - margin) };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * 피해 계산 (방어율 및 절대 방어 적용)
 */
export function calculateDamage(rawDamage, defensePercent, absoluteDefense) {
  const afterAbsolute = Math.max(0, rawDamage - absoluteDefense);
  const afterPercent = afterAbsolute * (1 - defensePercent / 100);
  return Math.max(0, afterPercent);
}
