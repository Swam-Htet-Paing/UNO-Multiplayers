import React from 'react';
import { RefreshCw, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import PlayerHand from './PlayerHand';

export default function GameBoard({
  room,
  currentUser,
  socketId,
  onPlayCard,
  onDrawCard,
  onCallUno
}) {
  if (!room) return null;

  const me = room.players?.find((p) => p.socketId === socketId);
  const isMyTurn = room.players?.[room.currentTurn]?.socketId === socketId;
  const currentTurnPlayer = room.players?.[room.currentTurn];
  const topDiscardCard = room.discardPile?.[room.discardPile.length - 1];

  // Helper color mappings for active card background
  const colorBgMap = {
    red: 'bg-red-600 border-red-400',
    blue: 'bg-blue-600 border-blue-400',
    green: 'bg-emerald-600 border-emerald-400',
    yellow: 'bg-amber-500 border-amber-300',
    wild: 'bg-slate-950 border-purple-500'
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-7xl mx-auto w-full select-none">
      
      {/* Top Section: Opponents List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {room.players
          ?.filter((p) => p.socketId !== socketId)
          .map((opponent) => {
            const isOpponentTurn = room.players[room.currentTurn]?.socketId === opponent.socketId;
            return (
              <div
                key={opponent.socketId}
                className={`flex items-center space-x-3 p-3 rounded-2xl border transition-all ${
                  isOpponentTurn
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="relative">
                  <img
                    src={opponent.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png'}
                    alt={opponent.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-slate-700"
                  />
                  {opponent.saidUno && (
                    <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow animate-bounce">
                      UNO!
                    </span>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{opponent.username}</p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    🎴 {opponent.hand?.length || 0} cards
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {/* Center Arena: Draw Pile + Discard Pile + Turn Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 space-y-6">
        
        {/* Status Banner */}
        <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-full shadow-lg">
          <ArrowRightLeft className={`w-4 h-4 ${room.direction === 1 ? 'text-indigo-400' : 'text-amber-400 transform rotate-180'}`} />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            Current Turn:{' '}
            <span className={isMyTurn ? 'text-emerald-400 font-extrabold' : 'text-indigo-400'}>
              {isMyTurn ? 'YOUR TURN!' : currentTurnPlayer?.username}
            </span>
          </span>
        </div>

        {/* Card Arena */}
        <div className="flex items-center justify-center space-x-6 sm:space-x-12">
          
          {/* Draw Deck Stack */}
          <button
            onClick={onDrawCard}
            disabled={!isMyTurn}
            className={`group relative w-24 sm:w-32 h-36 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-center transition-transform ${
              isMyTurn ? 'hover:scale-105 active:scale-95 border-indigo-500 cursor-pointer' : 'opacity-80 cursor-not-allowed'
            }`}
          >
            {/* Card Back Graphic */}
            <div className="w-16 sm:w-20 h-24 sm:h-32 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center transform group-hover:rotate-3 transition">
              <span className="font-black text-xs sm:text-sm text-indigo-400 tracking-wider">UNO</span>
            </div>
            <span className="absolute bottom-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Draw Card
            </span>
          </button>

          {/* Active Discard Pile */}
          <div className="relative">
            <div
              className={`w-24 sm:w-32 h-36 sm:h-48 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-between p-3 transform -rotate-1 transition-all ${
                colorBgMap[room.currentColor] || 'bg-slate-900 border-slate-700'
              }`}
            >
              <span className="self-start text-xs font-black text-white">{topDiscardCard?.value}</span>
              <span className="text-2xl sm:text-4xl font-black text-white uppercase drop-shadow-md tracking-wider">
                {topDiscardCard?.value}
              </span>
              <span className="self-end text-xs font-black text-white">{topDiscardCard?.value}</span>
            </div>

            {/* Current Color Highlight Ring */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 shadow">
              <span className="text-[10px] uppercase font-bold text-slate-400">Active Color:</span>
              <span className="text-xs font-extrabold uppercase text-white" style={{ color: room.currentColor }}>
                {room.currentColor}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section: My Hand & Action Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-400">Your Hand ({me?.hand?.length || 0})</span>
          
          {/* Call UNO Button */}
          <button
            onClick={onCallUno}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-red-600/30 transform active:scale-95 transition flex items-center space-x-1"
          >
            <ShieldAlert className="w-4 h-4 mr-1" />
            <span>SAY UNO!</span>
          </button>
        </div>

        <PlayerHand
          hand={me?.hand || []}
          isMyTurn={isMyTurn}
          currentColor={room.currentColor}
          topCard={topDiscardCard}
          onPlayCard={onPlayCard}
        />
      </div>

    </div>
  );
}