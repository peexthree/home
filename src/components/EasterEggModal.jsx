import React from 'react';
import confetti from 'canvas-confetti';
import { Zap, Sparkles } from 'lucide-react';
import { GAME_CONFIG } from '../game/config';
import { sound } from '../utils/sound';

export default function EasterEggModal({ onClose, onApplyCheat }) {
  const secret = GAME_CONFIG.easterEggs.secretMessage;

  const handleApply = () => {
    sound.playBonus();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onApplyCheat(secret.bonusScore);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="max-w-xs w-full bg-gradient-to-b from-amber-950 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-[0_0_40px_rgba(251,191,36,0.4)] text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-spin" style={{ animationDuration: '8s' }}>
          ⭐
        </div>

        <h3 className="text-xl font-black text-amber-300 mb-1">
          {secret.title}
        </h3>
        <p className="text-xs text-amber-400 font-semibold mb-3">
          {secret.subtitle}
        </p>

        <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-800/80 p-3.5 rounded-2xl border border-amber-500/20">
          {secret.description}
        </p>

        <button
          onClick={handleApply}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition duration-200"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{secret.buttonText}</span>
        </button>
      </div>
    </div>
  );
}
