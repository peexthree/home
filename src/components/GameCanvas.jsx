import React, { useEffect, useRef } from 'react';
import {
  GAME_CONSTANTS,
  getSpeedForScore,
  checkCollision,
  checkBonusCollected,
} from '../game/physics';
import { sound } from '../utils/sound';
import { loadGameImage, ASSET_PATHS } from '../utils/assets';

export default function GameCanvas({
  gameState, // 'ready' | 'playing' | 'gameover' | 'victory'
  score,
  setScore,
  lives,
  setLives,
  onGameOver,
  onVictory,
}) {
  const canvasRef = useRef(null);

  // References for game state inside requestAnimationFrame loop
  const engineRef = useRef({
    score: 0,
    lives: GAME_CONSTANTS.INITIAL_LIVES,
    hero: {
      x: 60,
      y: 280,
      vy: 0,
      width: GAME_CONSTANTS.HERO_SIZE,
      height: GAME_CONSTANTS.HERO_SIZE,
      invulnerableUntil: 0,
      rotation: 0,
    },
    obstacles: [],
    bonuses: [],
    particles: [],
    lastSpawnTime: 0,
    nextSpawnInterval: 1400,
    bgOffsetFar: 0,
    bgOffsetNear: 0,
    animationFrameId: null,
    lastFrameTime: 0,
  });

  // Images cache
  const imagesRef = useRef({
    hero: null,
    obstacle: null,
    bonus: null,
    bgFar: null,
    bgNear: null,
  });

  // Load images with fallback handling
  useEffect(() => {
    imagesRef.current.hero = loadGameImage(ASSET_PATHS.hero.png, ASSET_PATHS.hero.fallback);
    imagesRef.current.obstacle = loadGameImage(ASSET_PATHS.obstacle.png, ASSET_PATHS.obstacle.fallback);
    imagesRef.current.bonus = loadGameImage(ASSET_PATHS.bonus.png, ASSET_PATHS.bonus.fallback);

    // Optional backgrounds
    const bgFarImg = new Image();
    bgFarImg.src = ASSET_PATHS.bgFar.png;
    bgFarImg.onload = () => { imagesRef.current.bgFar = bgFarImg; };

    const bgNearImg = new Image();
    bgNearImg.src = ASSET_PATHS.bgNear.png;
    bgNearImg.onload = () => { imagesRef.current.bgNear = bgNearImg; };
  }, []);

  // Jump handler (click, tap, spacebar)
  const handleJump = () => {
    if (gameState !== 'playing') return;
    const engine = engineRef.current;
    engine.hero.vy = GAME_CONSTANTS.JUMP_IMPULSE;
    sound.playJump();

    // Spawn tiny thruster smoke particles
    for (let i = 0; i < 4; i++) {
      engine.particles.push({
        x: engine.hero.x + 12,
        y: engine.hero.y + engine.hero.height - 8,
        vx: -1.5 - Math.random() * 2,
        vy: 1 + Math.random() * 2,
        size: 4 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        alpha: 0.8,
        life: 25,
      });
    }
  };

  // Sync external state updates (reset, restart)
  useEffect(() => {
    if (gameState === 'ready' || gameState === 'playing') {
      const engine = engineRef.current;
      engine.score = score;
      engine.lives = lives;
      if (gameState === 'ready') {
        engine.hero.y = 280;
        engine.hero.vy = 0;
        engine.hero.rotation = 0;
        engine.hero.invulnerableUntil = 0;
        engine.obstacles = [];
        engine.bonuses = [];
        engine.particles = [];
      }
    }
  }, [gameState, score, lives]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateLoop = (timestamp) => {
      const engine = engineRef.current;
      if (!engine.lastFrameTime) engine.lastFrameTime = timestamp;
      const dt = Math.min((timestamp - engine.lastFrameTime) / 16.66, 2.5); // normalized frame step
      engine.lastFrameTime = timestamp;

      const cw = canvas.width;
      const ch = canvas.height;
      const currentSpeed = getSpeedForScore(engine.score);

      // --- 1. PHYSICS UPDATE ---
      if (gameState === 'playing') {
        // Gravity & Velocity
        engine.hero.vy += GAME_CONSTANTS.GRAVITY * dt;
        engine.hero.y += engine.hero.vy * dt;

        // Smooth rotation angle based on vertical speed
        engine.hero.rotation = Math.min(Math.max(engine.hero.vy * 0.05, -0.4), 0.6);

        // Ceiling and floor bounds
        if (engine.hero.y < 10) {
          engine.hero.y = 10;
          engine.hero.vy = 0;
        }

        const floorY = ch - engine.hero.height - 20;
        if (engine.hero.y > floorY) {
          engine.hero.y = floorY;
          engine.hero.vy = 0;
        }

        // Background scrolling
        engine.bgOffsetFar = (engine.bgOffsetFar + currentSpeed * 0.3 * dt) % cw;
        engine.bgOffsetNear = (engine.bgOffsetNear + currentSpeed * 0.8 * dt) % cw;

        // Spawn obstacles and bonuses
        if (timestamp - engine.lastSpawnTime > engine.nextSpawnInterval) {
          engine.lastSpawnTime = timestamp;
          engine.nextSpawnInterval =
            GAME_CONSTANTS.SPAWN_INTERVAL_MIN +
            Math.random() * (GAME_CONSTANTS.SPAWN_INTERVAL_MAX - GAME_CONSTANTS.SPAWN_INTERVAL_MIN);

          // Random vertical position within playable zone
          const obstacleY = 60 + Math.random() * (ch - 240);
          engine.obstacles.push({
            x: cw + 20,
            y: obstacleY,
            width: GAME_CONSTANTS.OBSTACLE_WIDTH,
            height: GAME_CONSTANTS.OBSTACLE_HEIGHT,
            passed: false,
          });

          // Bonus spawn (approx 65% chance alongside or offset from obstacle)
          if (Math.random() < 0.65) {
            // Keep bonus comfortably placed above or below obstacle, or slightly delayed
            let bonusY = obstacleY < ch / 2 ? obstacleY + 110 : obstacleY - 80;
            bonusY = Math.max(50, Math.min(ch - 120, bonusY));

            engine.bonuses.push({
              x: cw + 140 + (Math.random() * 80 - 40),
              y: bonusY,
              width: GAME_CONSTANTS.BONUS_SIZE,
              height: GAME_CONSTANTS.BONUS_SIZE,
              collected: false,
              wobble: Math.random() * Math.PI * 2,
            });
          }
        }

        // Update obstacles
        const isInvulnerable = timestamp < engine.hero.invulnerableUntil;

        for (let i = engine.obstacles.length - 1; i >= 0; i--) {
          const obs = engine.obstacles[i];
          obs.x -= currentSpeed * dt;

          // Check passing for points (+2)
          if (!obs.passed && obs.x + obs.width < engine.hero.x) {
            obs.passed = true;
            const newScore = Math.min(GAME_CONSTANTS.MAX_SCORE, engine.score + GAME_CONSTANTS.OBSTACLE_PASS_POINTS);
            engine.score = newScore;
            setScore(newScore);
            sound.playScorePass();

            if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
              onVictory();
              return;
            }
          }

          // Check collision with hero
          if (!isInvulnerable && checkCollision(engine.hero, obs, 14)) {
            // Take damage
            engine.lives -= 1;
            setLives(engine.lives);
            engine.hero.invulnerableUntil = timestamp + GAME_CONSTANTS.INVULNERABILITY_TIME_MS;
            sound.playDamage();

            // Screen shake / burst particles
            for (let p = 0; p < 8; p++) {
              engine.particles.push({
                x: engine.hero.x + engine.hero.width / 2,
                y: engine.hero.y + engine.hero.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: 5 + Math.random() * 5,
                color: '#f43f5e',
                alpha: 1,
                life: 30,
              });
            }

            if (engine.lives <= 0) {
              sound.playGameOver();
              onGameOver(engine.score);
              return;
            }
          }

          // Cull offscreen
          if (obs.x + obs.width < -50) {
            engine.obstacles.splice(i, 1);
          }
        }

        // Update bonuses
        for (let i = engine.bonuses.length - 1; i >= 0; i--) {
          const bon = engine.bonuses[i];
          bon.x -= currentSpeed * dt;
          bon.wobble += 0.08 * dt;

          // Check collection (+10)
          if (!bon.collected && checkBonusCollected(engine.hero, bon)) {
            bon.collected = true;
            const newScore = Math.min(GAME_CONSTANTS.MAX_SCORE, engine.score + GAME_CONSTANTS.BONUS_POINTS);
            engine.score = newScore;
            setScore(newScore);
            sound.playBonus();

            // Sparkle burst particles
            for (let p = 0; p < 10; p++) {
              engine.particles.push({
                x: bon.x + bon.width / 2,
                y: bon.y + bon.height / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: 3 + Math.random() * 4,
                color: '#facc15',
                alpha: 1,
                life: 25,
              });
            }

            engine.bonuses.splice(i, 1);

            if (newScore >= GAME_CONSTANTS.MAX_SCORE) {
              onVictory();
              return;
            }
            continue;
          }

          // Cull offscreen
          if (bon.x + bon.width < -50) {
            engine.bonuses.splice(i, 1);
          }
        }

        // Update particles
        for (let i = engine.particles.length - 1; i >= 0; i--) {
          const p = engine.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          p.alpha = Math.max(0, p.life / 30);
          if (p.life <= 0) {
            engine.particles.splice(i, 1);
          }
        }
      }

      // --- 2. CANVAS RENDERING ---
      ctx.clearRect(0, 0, cw, ch);

      // Sky Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, ch);
      skyGrad.addColorStop(0, '#0f172a'); // deep midnight top
      skyGrad.addColorStop(0.55, '#1e3a8a'); // rich twilight blue
      skyGrad.addColorStop(0.85, '#3b82f6'); // bright horizon
      skyGrad.addColorStop(1, '#93c5fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cw, ch);

      // Procedural Parallax Stars & Distant Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let s = 0; s < 30; s++) {
        const sx = ((s * 73 - engine.bgOffsetFar * 0.4) % cw + cw) % cw;
        const sy = (s * 37) % (ch * 0.45);
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Parallax Distant City Silhouette / Clouds
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      for (let b = 0; b < 10; b++) {
        const bx = ((b * 90 - engine.bgOffsetFar) % (cw + 100) + cw + 100) % (cw + 100) - 50;
        const bHeight = 80 + (b * 19) % 90;
        ctx.fillRect(bx, ch - bHeight - 15, 60, bHeight);
      }

      // Ground Track / Street lights line
      const groundGrad = ctx.createLinearGradient(0, ch - 20, 0, ch);
      groundGrad.addColorStop(0, '#0284c7');
      groundGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, ch - 20, cw, 20);

      // Draw Obstacles
      engine.obstacles.forEach((obs) => {
        const img = imagesRef.current.obstacle;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
        } else {
          // Fallback box
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 10);
          ctx.fill();
        }
      });

      // Draw Bonuses
      engine.bonuses.forEach((bon) => {
        const img = imagesRef.current.bonus;
        const wobbleY = Math.sin(bon.wobble) * 5;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, bon.x, bon.y + wobbleY, bon.width, bon.height);
        } else {
          // Fallback star / cake
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(bon.x + bon.width / 2, bon.y + bon.height / 2 + wobbleY, bon.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Hero
      const hero = engine.hero;
      const isInvulnerable = timestamp < hero.invulnerableUntil;
      const shouldFlicker = isInvulnerable && Math.floor(timestamp / 100) % 2 === 0;

      if (!shouldFlicker) {
        ctx.save();
        ctx.translate(hero.x + hero.width / 2, hero.y + hero.height / 2);
        ctx.rotate(hero.rotation);

        const img = imagesRef.current.hero;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, -hero.width / 2, -hero.height / 2, hero.width, hero.height);
        } else {
          // Fallback circle hero
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, hero.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Particles
      engine.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      engine.animationFrameId = requestAnimationFrame(updateLoop);
    };

    engineRef.current.animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      if (engineRef.current.animationFrameId) {
        cancelAnimationFrame(engineRef.current.animationFrameId);
      }
    };
  }, [gameState, onGameOver, onVictory, setScore, setLives]);

  // Keyboard Spacebar Jump Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  return (
    <div
      onClick={handleJump}
      onTouchStart={(e) => {
        // Prevent zoom/scroll and trigger jump
        if (e.cancelable) e.preventDefault();
        handleJump();
      }}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none touch-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.CANVAS_WIDTH}
        height={GAME_CONSTANTS.CANVAS_HEIGHT}
        className="w-full h-full object-contain max-w-[460px] max-h-[920px] shadow-2xl bg-slate-900 border-x border-slate-800"
      />
    </div>
  );
}
