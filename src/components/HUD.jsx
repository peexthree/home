import React from 'react';
import { Heart, Volume2, VolumeX, Trophy, Sparkles } from 'lucide-react';
import { GAME_CONSTANTS } from '../game/physics';

export default function HUD({
  score,
  highScore,
  lives,
  maxLives = GAME_CONSTANTS.INITIAL_LIVES,
  isMuted,
  onToggleSound,
}) {
  const progressPercent = Math.min(100, Math.round((score / GAME_CONSTANTS.MAX_SCORE) * 100));

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 flex flex-col gap-2">
      {/* Top Bar: Stats & Controls */}
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto w-full">
        {/* Lives Counter (Hearts) */}
        <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
          {Array.from({ length: maxLives }).map((_, i) => {
            const isFull = i < lives;
            return (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform duration-300 ${
                  isFull
                    ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'text-slate-600 scale-90 opacity-40'
                }`}
              />
            );
          })}
        </div>

        {/* Current Score Display */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-amber-500/40 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-extrabold text-lg text-amber-300 tracking-wider">
            {score}
          </span>
          <span className="text-xs text-slate-400 font-bold">/ 100</span>
        </div>

        {/* High Score & Sound Toggle Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {highScore > 0 && (
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-300 font-semibold shadow">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>{highScore}</span>
            </div>
          )}

          <button
            onClick={onToggleSound}
            aria-label={isMuted ? "Включить звук" : "Выключить звук"}
            className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition active:scale-95 shadow-lg"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar towards 100 */}
      <div className="max-w-md mx-auto w-full px-1">
        <div className="w-full bg-slate-900/70 backdrop-blur-sm h-2 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
