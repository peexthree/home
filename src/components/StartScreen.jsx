import React from 'react';
import { Play, Sparkles, Heart, Zap } from 'lucide-react';

export default function StartScreen({ onStart }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="max-w-xs w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Animated Badge */}
        <div className="w-20 h-20 mb-3 relative flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
          <img
            src="/images/hero-fallback.svg"
            alt="Hero"
            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(59,130,246,0.5)]"
          />
        </div>

        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400 mb-1">
          Полет на ДР Жени! 🚀
        </h1>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Тапай по экрану, чтобы парить! Собирай тортики и пиво, уворачивайся от виски, горящих дедлайнов и злых будильников. Лови приветы от бро с красными дредами и гладь кошечку Сметанку!
        </p>

        {/* Quick Rules Pills */}
        <div className="w-full grid grid-cols-2 gap-2 mb-6 text-[11px] font-medium text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
            <span className="text-base">🎂 🍺</span>
            <span>+10 бонус</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
            <span className="text-base">🥃 ⏰ 🔥</span>
            <span>+2 за пролет</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>3 жизни</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Цель: 100</span>
          </div>
        </div>

        {/* Start Game Big Button */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 transition duration-200"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>ПОЛЕТЕЛИ!</span>
        </button>

        <span className="text-[10px] text-slate-500 mt-3 font-semibold">
          Тап или клик для прыжка
        </span>
      </div>
    </div>
  );
}
