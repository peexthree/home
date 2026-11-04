// Physics and collision helper functions with unit-testable pure logic

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 420,
  CANVAS_HEIGHT: 700,
  GRAVITY: 0.38,
  JUMP_IMPULSE: -7.5,
  BASE_SPEED: 2.8,
  MAX_SPEED: 4.2,
  MAX_SCORE: 100,
  BONUS_POINTS: 10,
  OBSTACLE_PASS_POINTS: 2,
  INITIAL_LIVES: 3,
  INVULNERABILITY_TIME_MS: 1500,
  SPAWN_INTERVAL_MIN: 1300,
  SPAWN_INTERVAL_MAX: 1800,
  HERO_SIZE: 56,
  OBSTACLE_WIDTH: 74,
  OBSTACLE_HEIGHT: 52,
  BONUS_SIZE: 42,
  NPC_WIDTH: 70,
  NPC_HEIGHT: 70,
  NPC_MIN_INTERVAL: 8000,
  NPC_MAX_INTERVAL: 14000,
};

/**
 * Updates an active NPC flyer across the screen.
 * @param {object} npc - { x, y, vx, vy, ... }
 * @param {number} dt - delta time multiplier
 */
export function updateNPC(npc, dt) {
  if (!npc) return null;
  npc.x += npc.vx * dt;
  npc.y += (npc.vy || 0) * dt;
  npc.wobble = (npc.wobble || 0) + 0.05 * dt;
  return npc;
}

/**
 * Calculates current game scrolling speed based on score.
 * Gentle ramp-up, especially closer to 80+ points, keeping the game comfortable.
 */
export function getSpeedForScore(score) {
  const progress = Math.min(Math.max(score / GAME_CONSTANTS.MAX_SCORE, 0), 1);
  return GAME_CONSTANTS.BASE_SPEED + (GAME_CONSTANTS.MAX_SPEED - GAME_CONSTANTS.BASE_SPEED) * Math.pow(progress, 1.4);
}

/**
 * Collision check between hero and another bounding box with inner padding for forgiving hitboxes.
 * @param {object} hero - { x, y, width, height }
 * @param {object} target - { x, y, width, height }
 * @param {number} padding - forgiving tolerance in px
 */
export function checkCollision(hero, target, padding = 12) {
  const heroLeft = hero.x + padding;
  const heroRight = hero.x + hero.width - padding;
  const heroTop = hero.y + padding;
  const heroBottom = hero.y + hero.height - padding;

  const targetLeft = target.x + padding;
  const targetRight = target.x + target.width - padding;
  const targetTop = target.y + padding;
  const targetBottom = target.y + target.height - padding;

  return (
    heroLeft < targetRight &&
    heroRight > targetLeft &&
    heroTop < targetBottom &&
    heroBottom > targetTop
  );
}

/**
 * Check if bonus is collected (circle/box check with generous radius)
 */
export function checkBonusCollected(hero, bonus) {
  const heroCenterX = hero.x + hero.width / 2;
  const heroCenterY = hero.y + hero.height / 2;
  const bonusCenterX = bonus.x + bonus.width / 2;
  const bonusCenterY = bonus.y + bonus.height / 2;

  const dx = heroCenterX - bonusCenterX;
  const dy = heroCenterY - bonusCenterY;
  const distance = Math.hypot(dx, dy);

  // Friendly collision radius
  const hitRadius = (hero.width + bonus.width) * 0.38;
  return distance < hitRadius;
}
