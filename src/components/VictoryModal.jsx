import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Gift, PartyPopper } from 'lucide-react';
import { sound } from '../utils/sound';

export default function VictoryModal({ onRestart }) {
  // Fire initial celebratory confetti on mount
  useEffect(() => {
    sound.playVictory();

    // Side cannons confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#facc15', '#a855f7'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
        zIndex: 100,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
        zIndex: 100,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Extra massive firework on button click
  const triggerBrotherSalute = () => {
    sound.playBonus();

    const count = 200;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 110,
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
      <div className="max-w-sm w-full bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center flex flex-col items-center my-auto animate-in fade-in zoom-in-95 duration-300">

        {/* Birthday Cap / Crown Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 mb-3 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl">
            👑
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 mb-3 tracking-tight">
          С днем рождения, Женя!
        </h2>

        {/* Heartfelt Greeting Card */}
        <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 mb-5 text-left text-xs leading-relaxed text-slate-200 space-y-2.5 shadow-inner">
          <p className="font-bold text-amber-300 text-sm">
            Женька, с днем рождения, брат!
          </p>
          <p className="text-slate-300">
            Хоть между нами сейчас сотни километров и Питер не за углом, настоящая дружба расстояний не замечает.
          </p>
          <p className="text-slate-300">
            Желаю тебе железобетонного здоровья, неиссякаемой энергии, уверенности во всем и чтобы любые цели щелкались так же легко, как эта игра. Пусть дома всегда царят мир, тепло и уют, а все задуманные планы взлетают на максимум.
          </p>
          <p className="font-semibold text-rose-300 pt-1 border-t border-slate-700/60">
            Подарок и нормальная простава — за мной при первой же встрече. Обнял по-братски! 🤝
          </p>
        </div>

        {/* Main Action: Brother Salute Button */}
        <button
          onClick={triggerBrotherSalute}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 active:scale-95 text-white font-extrabold text-base rounded-2xl shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 transition duration-200 mb-3 animate-pulse"
        >
          <PartyPopper className="w-5 h-5 text-yellow-200" />
          <span>Забрать братский салют 🎉</span>
        </button>

        {/* Replay Button */}
        <button
          onClick={onRestart}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1"
        >
          Сыграть еще раз
        </button>
      </div>
    </div>
  );
}
