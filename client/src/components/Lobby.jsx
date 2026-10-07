import React, { useState } from 'react';
import { PlusCircle, Lock, Unlock, Play, Users, Hash, RefreshCw } from 'lucide-react';

export default function Lobby({ rooms = [], onCreateRoom, onJoinRoom, onRefreshRooms }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinPassword, setJoinPassword] = useState('');
  const [targetRoom, setTargetRoom] = useState(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!roomIdInput.trim()) return alert('Please specify a Room Code.');
    onCreateRoom({
      roomId: roomIdInput.trim().toUpperCase(),
      isPrivate,
      password: isPrivate ? passwordInput : null,
      maxPlayers: Number(maxPlayers)
    });
    setShowCreateModal(false);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!targetRoom) return;
    onJoinRoom({ roomId: targetRoom.id, password: joinPassword });
    setTargetRoom(null);
    setJoinPassword('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Multiplayer Lobby</h2>
          <p className="text-slate-400 text-sm mt-1">Create a private custom match or join an open room.</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onRefreshRooms}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Room List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Room</span>
          </button>
        </div>
      </div>

      {/* Available Rooms Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
          <span>Active Rooms</span>
          <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">
            {rooms.length} Available
          </span>
        </h3>

        {rooms.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-semibold">No active public rooms right now.</p>
            <p className="text-xs text-slate-500 mt-1">Be the first player to start a new match!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-white text-lg tracking-wider font-mono">{room.id}</span>
                      {room.isPrivate ? (
                        <Lock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Unlock className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Host: <span className="text-slate-200 font-medium">{room.hostName || 'Player'}</span></p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    {room.playerCount}/{room.maxPlayers}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {room.gameState === 'LOBBY' ? 'Waiting in Lobby' : 'In Progress'}
                  </span>
                  <button
                    onClick={() => {
                      if (room.isPrivate) {
                        setTargetRoom(room);
                      } else {
                        onJoinRoom({ roomId: room.id });
                      }
                    }}
                    disabled={room.playerCount >= room.maxPlayers || room.gameState !== 'LOBBY'}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-xl transition"
                  >
                    <span>Join</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-xl font-black text-white">Create New Match</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Room Code</label>
                <div className="relative">
                  <Hash className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    placeholder="E.g., UNO2026"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-sm font-semibold text-slate-200">Private Room</span>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {isPrivate && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Room Password</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Max Players</label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={2}>2 Players (1v1 Quick Duel)</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players (Standard UNO)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Private Room Password Modal */}
      {targetRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              <Lock className="w-5 h-5 text-amber-400 mr-2" />
              Private Room Password
            </h3>
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <input
                type="password"
                required
                autoFocus
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Enter password for room"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setTargetRoom(null)}
                  className="w-1/2 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}