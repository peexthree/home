import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import GameOverModal from './components/GameOverModal';
import VictoryModal from './components/VictoryModal';
import SecretKittyEasterEgg from './components/SecretKittyEasterEgg';
import { sound } from './utils/sound';
import { GAME_CONSTANTS } from './game/physics';

export default function App() {
  const [gameState, setGameState] = useState('ready'); // 'ready' | 'playing' | 'gameover' | 'victory'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('zhenya_game_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(GAME_CONSTANTS.INITIAL_LIVES);
  const [isMuted, setIsMuted] = useState(false);

  // Sync high score to localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('zhenya_game_highscore', score.toString());
    }
  }, [score, highScore]);

  const handleStartGame = () => {
    sound.init();
    setScore(0);
    setLives(GAME_CONSTANTS.INITIAL_LIVES);
    setGameState('playing');
  };

  const handleRestartGame = () => {
    sound.init();
    setScore(0);
    setLives(GAME_CONSTANTS.INITIAL_LIVES);
    setGameState('playing');
  };

  const handleGameOver = (finalScore) => {
    setGameState('gameover');
  };

  const handleVictory = () => {
    setGameState('victory');
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Top HUD with score, hearts, progress bar, audio toggle */}
      <HUD
        score={score}
        highScore={highScore}
        lives={lives}
        maxLives={GAME_CONSTANTS.INITIAL_LIVES}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main Canvas Engine */}
      <GameCanvas
        gameState={gameState}
        score={score}
        setScore={setScore}
        lives={lives}
        setLives={setLives}
        onGameOver={handleGameOver}
        onVictory={handleVictory}
      />

      {/* Discreet White Kitty Easter Egg */}
      <SecretKittyEasterEgg />

      {/* State Modals */}
      {gameState === 'ready' && <StartScreen onStart={handleStartGame} />}
      {gameState === 'gameover' && (
        <GameOverModal
          score={score}
          highScore={highScore}
          onRestart={handleRestartGame}
        />
      )}
      {gameState === 'victory' && (
        <VictoryModal onRestart={handleRestartGame} />
      )}
    </div>
  );
}
