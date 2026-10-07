import React from 'react';

export default function PlayerHand({ hand = [], isMyTurn, currentColor, topCard, onPlayCard }) {
  
  const isCardPlayable = (card) => {
    if (!isMyTurn) return false;
    if (card.color === 'wild') return true;
    if (card.color === currentColor) return true;
    if (topCard && card.value === topCard.value) return true;
    return false;
  };

  const getCardBg = (color) => {
    switch (color) {
      case 'red': return 'bg-red-600 border-red-400 text-white';
      case 'blue': return 'bg-blue-600 border-blue-400 text-white';
      case 'green': return 'bg-emerald-600 border-emerald-400 text-white';
      case 'yellow': return 'bg-amber-500 border-amber-300 text-slate-950';
      default: return 'bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 border-indigo-400 text-white';
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2 no-scrollbar">
      <div className="flex items-center space-x-[-1.5rem] sm:space-x-[-2rem] px-4 min-w-max">
        {hand.map((card, idx) => {
          const playable = isCardPlayable(card);

          return (
            <button
              key={card.id || idx}
              onClick={() => playable && onPlayCard(card)}
              disabled={!playable}
              style={{ zIndex: idx }}
              className={`relative w-20 sm:w-28 h-32 sm:h-44 rounded-2xl border-2 p-2 flex flex-col justify-between shadow-xl transition-all transform duration-200 ${getCardBg(
                card.color
              )} ${
                playable
                  ? 'hover:-translate-y-6 hover:rotate-1 hover:z-50 cursor-pointer ring-4 ring-emerald-400/80 shadow-emerald-500/30'
                  : 'opacity-75 grayscale-[30%] cursor-not-allowed'
              }`}
            >
              {/* Corner Value */}
              <span className="self-start text-xs sm:text-sm font-black tracking-tighter">{card.value}</span>

              {/* Center Card Value */}
              <div className="self-center my-auto">
                <span className="text-xl sm:text-3xl font-black uppercase tracking-wider drop-shadow-sm">
                  {card.value}
                </span>
              </div>

              {/* Inverted Corner Value */}
              <span className="self-end text-xs sm:text-sm font-black tracking-tighter rotate-180">
                {card.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}