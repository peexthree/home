import React, { useEffect, useRef } from 'react';
import {
  GAME_CONSTANTS,
  getSpeedForScore,
  checkCollision,
  checkBonusCollected,
  updateNPC,
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
    activeNPC: null,
    lastNpcTime: 0,
    nextNpcInterval: 2500,
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
    obstacleWhiskey: null,
    obstacleDeadline: null,
    obstacleAlarm: null,
    bonusCake: null,
    bonusBeer: null,
    npcDreads: null,
    bgFar: null,
    bgNear: null,
  });

  // Load images with fallback handling
  useEffect(() => {
    imagesRef.current.hero = loadGameImage(ASSET_PATHS.hero.png, ASSET_PATHS.hero.fallback);
    imagesRef.current.obstacleWhiskey = loadGameImage(ASSET_PATHS.obstacle.png, ASSET_PATHS.obstacle.fallback);
    imagesRef.current.obstacleDeadline = loadGameImage(ASSET_PATHS.obstacleDeadline.png, ASSET_PATHS.obstacleDeadline.fallback);
    imagesRef.current.obstacleAlarm = loadGameImage(ASSET_PATHS.obstacleAlarm.png, ASSET_PATHS.obstacleAlarm.fallback);
    imagesRef.current.bonusCake = loadGameImage(ASSET_PATHS.bonus.png, ASSET_PATHS.bonus.fallback);
    imagesRef.current.bonusBeer = loadGameImage(ASSET_PATHS.bonusBeer.png, ASSET_PATHS.bonusBeer.fallback);
    imagesRef.current.npcDreads = loadGameImage(ASSET_PATHS.npcDreads.png, ASSET_PATHS.npcDreads.fallback);

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
        engine.activeNPC = null;
        engine.lastNpcTime = 0;
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

        // --- NPC Flying Buddy with Red Dreads Spawning & Updating ---
        if (!engine.activeNPC && timestamp - engine.lastNpcTime > engine.nextNpcInterval) {
          engine.lastNpcTime = timestamp;
          engine.nextNpcInterval =
            GAME_CONSTANTS.NPC_MIN_INTERVAL +
            Math.random() * (GAME_CONSTANTS.NPC_MAX_INTERVAL - GAME_CONSTANTS.NPC_MIN_INTERVAL);

          const npcPhrases = [
            'Женя, с днюхой! 🤘',
            'Йоу, полетели! 🚀',
            'Держи высоту, бро! ⚡',
            'Красава! Только вперед! 🎉',
          ];
          const randomPhrase = npcPhrases[Math.floor(Math.random() * npcPhrases.length)];

          // Fly from left to right or right to left
          // Flying faster overtaking or passing by
          const fromLeft = Math.random() > 0.4;
          engine.activeNPC = {
            x: fromLeft ? -100 : cw + 40,
            y: 70 + Math.random() * (ch * 0.35),
            vx: fromLeft ? currentSpeed + 2.0 : -(currentSpeed + 1.8),
            vy: (Math.random() - 0.5) * 0.4,
            width: GAME_CONSTANTS.NPC_WIDTH,
            height: GAME_CONSTANTS.NPC_HEIGHT,
            wobble: 0,
            phrase: randomPhrase,
            direction: fromLeft ? 1 : -1,
          };
        }

        if (engine.activeNPC) {
          updateNPC(engine.activeNPC, dt);

          // Spawn cool jetpack smoke trail
          if (Math.random() < 0.6) {
            engine.particles.push({
              x: engine.activeNPC.direction === 1
                ? engine.activeNPC.x + 8
                : engine.activeNPC.x + engine.activeNPC.width - 8,
              y: engine.activeNPC.y + engine.activeNPC.height * 0.65,
              vx: -engine.activeNPC.direction * (1 + Math.random()),
              vy: (Math.random() - 0.5) * 1.5,
              size: 4 + Math.random() * 4,
              color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
              alpha: 0.7,
              life: 20,
            });
          }

          // Offscreen cull
          if (
            (engine.activeNPC.direction === 1 && engine.activeNPC.x > cw + 120) ||
            (engine.activeNPC.direction === -1 && engine.activeNPC.x < -140)
          ) {
            engine.activeNPC = null;
          }
        }

        // Spawn obstacles and bonuses
        if (timestamp - engine.lastSpawnTime > engine.nextSpawnInterval) {
          engine.lastSpawnTime = timestamp;
          engine.nextSpawnInterval =
            GAME_CONSTANTS.SPAWN_INTERVAL_MIN +
            Math.random() * (GAME_CONSTANTS.SPAWN_INTERVAL_MAX - GAME_CONSTANTS.SPAWN_INTERVAL_MIN);

          // Random vertical position within playable zone
          const obstacleY = 60 + Math.random() * (ch - 240);
          const obstacleTypes = ['whiskey', 'deadline', 'alarm'];
          const randType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const width = randType === 'alarm' ? 62 : GAME_CONSTANTS.OBSTACLE_WIDTH;
          const height = randType === 'alarm' ? 62 : GAME_CONSTANTS.OBSTACLE_HEIGHT;

          engine.obstacles.push({
            x: cw + 20,
            y: obstacleY,
            width,
            height,
            type: randType,
            wobble: Math.random() * Math.PI * 2,
            passed: false,
          });

          // Bonus spawn (approx 65% chance alongside or offset from obstacle)
          if (Math.random() < 0.65) {
            // Keep bonus comfortably placed above or below obstacle, or slightly delayed
            let bonusY = obstacleY < ch / 2 ? obstacleY + 110 : obstacleY - 80;
            bonusY = Math.max(50, Math.min(ch - 120, bonusY));

            const bonusType = Math.random() > 0.5 ? 'beer' : 'cake';
            engine.bonuses.push({
              x: cw + 140 + (Math.random() * 80 - 40),
              y: bonusY,
              width: GAME_CONSTANTS.BONUS_SIZE,
              height: GAME_CONSTANTS.BONUS_SIZE,
              type: bonusType,
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
          obs.wobble = (obs.wobble || 0) + 0.04 * dt;

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

      // Draw Obstacles (Whiskey bottle, Burning Deadline, Angry Alarm 07:00)
      engine.obstacles.forEach((obs) => {
        let img = imagesRef.current.obstacleWhiskey;
        if (obs.type === 'deadline') {
          img = imagesRef.current.obstacleDeadline;
        } else if (obs.type === 'alarm') {
          img = imagesRef.current.obstacleAlarm;
        }

        const wobbleY = Math.sin(obs.wobble || 0) * 3;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, obs.x, obs.y + wobbleY, obs.width, obs.height);
        } else {
          // Fallback box
          ctx.fillStyle = obs.type === 'deadline' ? '#dc2626' : obs.type === 'alarm' ? '#b91c1c' : '#ea580c';
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y + wobbleY, obs.width, obs.height, 10);
          ctx.fill();
        }
      });

      // Draw Bonuses (Cake or Beer)
      engine.bonuses.forEach((bon) => {
        const img = bon.type === 'beer' ? imagesRef.current.bonusBeer : imagesRef.current.bonusCake;
        const wobbleY = Math.sin(bon.wobble) * 5;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, bon.x, bon.y + wobbleY, bon.width, bon.height);
        } else {
          // Fallback star / icon
          ctx.fillStyle = bon.type === 'beer' ? '#38bdf8' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(bon.x + bon.width / 2, bon.y + bon.height / 2 + wobbleY, bon.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Flying NPC Friend with Red Dreads
      if (engine.activeNPC) {
        const npc = engine.activeNPC;
        const wobbleY = Math.sin(npc.wobble) * 6;
        ctx.save();
        ctx.translate(npc.x + npc.width / 2, npc.y + npc.height / 2 + wobbleY);
        if (npc.direction === -1) {
          ctx.scale(-1, 1);
        }

        const img = imagesRef.current.npcDreads;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, -npc.width / 2, -npc.height / 2, npc.width, npc.height);
        } else {
          // Fallback graphic for NPC
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, npc.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Speech bubble for NPC shout
        if (npc.x > 20 && npc.x < cw - 80) {
          ctx.save();
          const bubbleX = npc.x + 10;
          const bubbleY = npc.y + wobbleY - 24;
          ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
          const textMetrics = ctx.measureText(npc.phrase);
          const bubbleWidth = textMetrics.width + 16;
          const bubbleHeight = 22;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(bubbleX - 8, bubbleY, bubbleWidth, bubbleHeight, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#fef08a';
          ctx.fillText(npc.phrase, bubbleX, bubbleY + 15);
          ctx.restore();
        }
      }

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
