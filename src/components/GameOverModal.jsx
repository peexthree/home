import React from 'react';
import { RotateCcw, Trophy, Target } from 'lucide-react';
import { GAME_CONSTANTS } from '../game/physics';

export default function GameOverModal({ score, highScore, onRestart }) {
  const remaining = Math.max(0, GAME_CONSTANTS.MAX_SCORE - score);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-xs w-full bg-slate-900/95 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Sad / Oops Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          💥
        </div>

        <h2 className="text-2xl font-black text-rose-400 mb-1">
          Виски сбил с курса!
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {remaining > 0
            ? `Оставалось всего ${remaining} очков до победы и видео-награды!`
            : 'Почти получилось!'}
        </p>

        {/* Score Stats Card */}
        <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-5 flex justify-around items-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Счет</span>
            <span className="text-2xl font-black text-amber-300">{score}</span>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-400" /> Рекорд
            </span>
            <span className="text-2xl font-black text-slate-200">{highScore}</span>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition duration-200"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Попробовать снова</span>
        </button>
      </div>
    </div>
  );
}
