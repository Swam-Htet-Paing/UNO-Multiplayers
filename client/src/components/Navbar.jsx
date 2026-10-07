import React from 'react';
import { Volume2, VolumeX, Shield, Users, LogOut } from 'lucide-react';

export default function Navbar({ user, room, soundEnabled, onToggleSound, onLeaveRoom }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 flex items-center justify-center shadow-lg font-black text-white text-lg tracking-wider">
            U
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide leading-tight bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              UNO CLOUD
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Multiplayer</p>
          </div>
        </div>

        {/* Room Info Badge (If inside a room) */}
        {room && (
          <div className="hidden sm:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <span className="flex items-center text-xs font-semibold text-slate-300">
              <Shield className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Room: <span className="text-white ml-1 font-mono uppercase tracking-wider">{room.id}</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center text-xs font-semibold text-slate-300">
              <Users className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              {room.players?.length || 0}/{room.maxPlayers || 4}
            </span>
          </div>
        )}

        {/* Controls & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title={soundEnabled ? "Mute Game Sound" : "Enable Game Sound"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png'}
                alt={user.username}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/50 shadow"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-200 leading-tight">{user.username}</p>
                <p className="text-[10px] text-emerald-400 font-medium">Online</p>
              </div>
            </div>
          )}

          {/* Leave Room Button */}
          {room && (
            <button
              onClick={onLeaveRoom}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white transition-all border border-rose-500/30 flex items-center space-x-1.5 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}