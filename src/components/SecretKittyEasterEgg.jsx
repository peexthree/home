import React, { useState } from 'react';
import { sound } from '../utils/sound';

/**
 * Secret White Kitty Easter Egg Component
 * Discreetly peeking from the bottom-right corner of the screen.
 * White fur, slightly crossed blue eyes (косая), cute pink nose and ears.
 * When tapped/clicked, shows an adorable animation and secret message.
 */
export default function SecretKittyEasterEgg() {
  const [clicked, setClicked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const phrases = [
    { title: '🐾 Кошечка Сметанка', text: 'Мур-р! Женя, с днем рождения! 💖' },
    { title: '🥛 Сметанка передает привет', text: 'Кушай тортик, держи высоту! 🎂' },
    { title: '✨ Сметанка заряжает', text: 'Мяу! Сегодня твой лучший день! 🚀' },
  ];

  const handleKittyClick = (e) => {
    e.stopPropagation();
    try {
      sound.playMeow();
    } catch (_) {}

    setClicked(true);
    setShowBubble(true);
    setPhraseIndex((prev) => (prev + 1) % phrases.length);

    setTimeout(() => {
      setShowBubble(false);
    }, 3800);

    setTimeout(() => {
      setClicked(false);
    }, 800);
  };

  const currentPhrase = phrases[phraseIndex];

  return (
    <div className="absolute bottom-1 right-2 z-40 select-none pointer-events-auto flex flex-col items-end">
      {/* Secret message speech bubble */}
      {showBubble && (
        <div className="absolute bottom-16 right-0 w-48 bg-slate-900/95 border-2 border-pink-400/80 rounded-2xl p-2.5 shadow-2xl text-center text-xs text-pink-200 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <p className="font-extrabold text-pink-300 flex items-center justify-center gap-1">
            {currentPhrase.title}
          </p>
          <p className="text-[11px] text-slate-200 mt-1 leading-snug font-medium">
            {currentPhrase.text}
          </p>
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-slate-900 border-r-2 border-b-2 border-pink-400/80 transform rotate-45" />
        </div>
      )}

      {/* Name tag badge */}
      <div className="bg-pink-950/80 border border-pink-500/50 rounded-full px-2 py-0.5 text-[10px] text-pink-300 font-bold mb-0.5 shadow-sm opacity-90 group-hover:opacity-100 flex items-center gap-1">
        <span>🐱</span>
        <span>Сметанка</span>
      </div>

      {/* Interactive Peeking Kitty Graphic */}
      <button
        type="button"
        onClick={handleKittyClick}
        aria-label="Кошечка Сметанка"
        className={`group relative p-1 cursor-pointer transition-transform duration-300 ${
          clicked ? 'scale-125 -translate-y-2' : 'hover:-translate-y-1.5 opacity-90 hover:opacity-100'
        }`}
        title="Кошечка Сметанка — погладь меня!"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 80 60"
          width="48"
          height="36"
          className="drop-shadow-[0_2px_8px_rgba(244,114,182,0.4)] transition-all"
        >
          <defs>
            <filter id="kittyShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3" />
            </filter>
          </defs>

          <g filter="url(#kittyShadow)">
            {/* Left Ear */}
            <polygon points="16,28 10,6 30,16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
            <polygon points="17,25 13,10 27,17" fill="#fbcfe8" />

            {/* Right Ear */}
            <polygon points="64,28 70,6 50,16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
            <polygon points="63,25 67,10 53,17" fill="#fbcfe8" />

            {/* White Cat Head (Peeking half-oval) */}
            <path
              d="M 12 45 C 10 22, 70 22, 68 45 C 68 55, 12 55, 12 45 Z"
              fill="#ffffff"
              stroke="#e2e8f0"
              stroke-width="1.5"
            />

            {/* Slightly Crossed Blue Eyes (косая кошечка) */}
            {/* Left Eye: Outer white, iris shifted slightly inward to right */}
            <ellipse cx="28" cy="33" rx="5" ry="5.5" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
            <ellipse cx="30" cy="33" rx="3.5" ry="4" fill="#38bdf8" />
            <ellipse cx="31" cy="33" rx="2" ry="2.8" fill="#0369a1" />
            <circle cx="31.5" cy="31.5" r="1.2" fill="#ffffff" />

            {/* Right Eye: Outer white, iris shifted slightly inward to left */}
            <ellipse cx="52" cy="33" rx="5" ry="5.5" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" />
            <ellipse cx="50" cy="33" rx="3.5" ry="4" fill="#38bdf8" />
            <ellipse cx="49" cy="33" rx="2" ry="2.8" fill="#0369a1" />
            <circle cx="48.5" cy="31.5" r="1.2" fill="#ffffff" />

            {/* Cute Pink Nose */}
            <polygon points="40,38 37,35 43,35" fill="#f472b6" stroke="#db2777" stroke-width="0.8" />

            {/* Whiskers */}
            <line x1="24" y1="40" x2="10" y2="38" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" />
            <line x1="24" y1="42" x2="11" y2="44" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" />
            <line x1="56" y1="40" x2="70" y2="38" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" />
            <line x1="56" y1="42" x2="69" y2="44" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round" />

            {/* Mouth */}
            <path d="M 37 40 Q 40 43 43 40" fill="none" stroke="#db2777" stroke-width="1.2" stroke-linecap="round" />

            {/* Little White Paws peeking over edge */}
            <ellipse cx="25" cy="52" rx="6" ry="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
            <ellipse cx="55" cy="52" rx="6" ry="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
          </g>
        </svg>
      </button>
    </div>
  );
}
