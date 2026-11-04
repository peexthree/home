import { describe, it, expect } from 'vitest';
import {
  GAME_CONSTANTS,
  getSpeedForScore,
  checkCollision,
  checkBonusCollected,
} from '../src/game/physics';

describe('Game Physics & Scoring Logic', () => {
  it('correctly calculates speed progression based on score', () => {
    const startSpeed = getSpeedForScore(0);
    const midSpeed = getSpeedForScore(50);
    const endSpeed = getSpeedForScore(100);

    expect(startSpeed).toBeCloseTo(GAME_CONSTANTS.BASE_SPEED, 1);
    expect(endSpeed).toBeCloseTo(GAME_CONSTANTS.MAX_SPEED, 1);
    expect(midSpeed).toBeGreaterThan(startSpeed);
    expect(midSpeed).toBeLessThan(endSpeed);
  });

  it('detects padded collisions accurately without harsh pixel-edges', () => {
    const hero = { x: 50, y: 50, width: 56, height: 56 };
    // Exact overlap
    const collidingObstacle = { x: 60, y: 60, width: 70, height: 50 };
    expect(checkCollision(hero, collidingObstacle, 10)).toBe(true);

    // Far away
    const farObstacle = { x: 200, y: 200, width: 70, height: 50 };
    expect(checkCollision(hero, farObstacle, 10)).toBe(false);

    // Grazing outer pixel (inside tolerance/padding, should NOT collide)
    const grazingObstacle = { x: 104, y: 50, width: 70, height: 50 };
    expect(checkCollision(hero, grazingObstacle, 12)).toBe(false);
  });

  it('detects bonus collection with generous radius', () => {
    const hero = { x: 60, y: 100, width: 56, height: 56 };
    const nearbyBonus = { x: 70, y: 110, width: 42, height: 42 };
    expect(checkBonusCollected(hero, nearbyBonus)).toBe(true);

    const farBonus = { x: 300, y: 100, width: 42, height: 42 };
    expect(checkBonusCollected(hero, farBonus)).toBe(false);
  });

  it('respects initial conditions and game bounds', () => {
    expect(GAME_CONSTANTS.INITIAL_LIVES).toBe(3);
    expect(GAME_CONSTANTS.MAX_SCORE).toBe(100);
    expect(GAME_CONSTANTS.BONUS_POINTS).toBe(10);
    expect(GAME_CONSTANTS.OBSTACLE_PASS_POINTS).toBe(2);
  });
});
