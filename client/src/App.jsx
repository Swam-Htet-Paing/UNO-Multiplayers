import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import ChatBox from './components/ChatBox';
import ColorPickerModal from './components/ColorPickerModal';
import AvatarUploader from './components/AvatarUploader';
import { Play, User, Sparkles } from 'lucide-react';

export default function App() {
  const { user, loginAsGuest, updateUser } = useAuth();
  const { socket, isConnected } = useSocket();

  const [guestName, setGuestName] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [publicRooms, setPublicRooms] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  // Web Audio Synthesizer for sound effects (draw, play, win)
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'play') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'draw') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('public_rooms_list', (rooms) => {
      setPublicRooms(rooms);
    });

    socket.on('room_updated', (room) => {
      setActiveRoom(room);
      setChatMessages(room.messages || []);
    });

    socket.on('game_started', (room) => {
      setActiveRoom(room);
      playSound('play');
    });

    socket.on('game_state_update', (room) => {
      setActiveRoom(room);
      playSound('play');
    });

    socket.on('new_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    socket.on('game_over', ({ winner }) => {
      playSound('win');
      alert(`🎉 Game Over! Winner: ${winner.username}`);
    });

    socket.on('error_message', (msg) => {
      alert(msg);
    });

    return () => {
      socket.off('public_rooms_list');
      socket.off('room_updated');
      socket.off('game_started');
      socket.off('game_state_update');
      socket.off('new_message');
      socket.off('game_over');
      socket.off('error_message');
    };
  }, [socket, soundEnabled]);

  // Guest Registration
  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    loginAsGuest(guestName.trim());
  };

  // Room Actions
  const handleCreateRoom = ({ roomId, isPrivate, password, maxPlayers }) => {
    if (!socket) return;
    socket.emit('create_room', { roomId, isPrivate, password, maxPlayers, user });
  };

  const handleJoinRoom = ({ roomId, password }) => {
    if (!socket) return;
    socket.emit('join_room', { roomId, password, user });
  };

  const handleStartGame = () => {
    if (!socket || !activeRoom) return;
    socket.emit('start_game', { roomId: activeRoom.id });
  };

  const handlePlayCard = (card) => {
    if (!socket || !activeRoom) return;

    if (card.color === 'wild') {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }

    socket.emit('play_card', { roomId: activeRoom.id, card, chosenColor: card.color });
  };

  const handleSelectWildColor = (color) => {
    if (!socket || !activeRoom || !pendingWildCard) return;
    socket.emit('play_card', {
      roomId: activeRoom.id,
      card: pendingWildCard,
      chosenColor: color
    });
    setShowColorPicker(false);
    setPendingWildCard(null);
  };

  const handleDrawCard = () => {
    if (!socket || !activeRoom) return;
    playSound('draw');
    socket.emit('draw_card', { roomId: activeRoom.id });
  };

  const handleCallUno = () => {
    if (!socket || !activeRoom) return;
    socket.emit('call_uno', { roomId: activeRoom.id });
  };

  const handleSendMessage = (text) => {
    if (!socket || !activeRoom) return;
    socket.emit('send_message', { roomId: activeRoom.id, message: text });
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    window.location.reload();
  };

  // 1. Guest Entry Screen (If no user set)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-red-600 via-yellow-500 to-blue-600 shadow-xl mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 bg-clip-text text-transparent">
              UNO CLOUD ARENA
            </h1>
            <p className="text-xs text-slate-400 mt-1">Real-Time Multiplayer MERN Stack Game</p>
          </div>

          <form onSubmit={handleGuestSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Enter Display Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="E.g., CardMaster99"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Play Now</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </form>

        </div>
      </div>
    );
  }

  // 2. Main Game View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      <Navbar
        user={user}
        room={activeRoom}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onLeaveRoom={handleLeaveRoom}
      />

      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-2 sm:p-4">
        {!activeRoom ? (
          /* Lobby View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl gap-4">
              <AvatarUploader
                userId={user._id}
                currentAvatarUrl={user.avatarUrl}
                onAvatarUpdated={(newUrl) => updateUser({ avatarUrl: newUrl })}
              />
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-white">{user.username}</h3>
                <p className="text-xs text-slate-400">Custom Cloudinary avatar uploaded directly to Object Storage.</p>
              </div>
            </div>

            <Lobby
              rooms={publicRooms}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onRefreshRooms={() => socket?.emit('get_public_rooms')}
            />
          </div>
        ) : activeRoom.gameState === 'LOBBY' ? (
          /* Room Waiting Lobby */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Lobby Waiting Room</span>
                <h2 className="text-3xl font-mono font-black text-white mt-1">ROOM: {activeRoom.id}</h2>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase">Players In Lobby ({activeRoom.players?.length}/{activeRoom.maxPlayers})</p>
                <div className="space-y-2">
                  {activeRoom.players?.map((p) => (
                    <div key={p.socketId} className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
                      <img src={p.avatarUrl} alt={p.username} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-bold text-white">{p.username}</span>
                      {p.socketId === activeRoom.host && (
                        <span className="ml-auto text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">HOST</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {activeRoom.host === socket?.id ? (
                <button
                  onClick={handleStartGame}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/30 transition"
                >
                  START MATCH
                </button>
              ) : (
                <p className="text-xs text-slate-400 animate-pulse">Waiting for host to start the game...</p>
              )}
            </div>
          </div>
        ) : (
          /* Active Gameplay View */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 flex flex-col">
              <GameBoard
                room={activeRoom}
                currentUser={user}
                socketId={socket?.id}
                onPlayCard={handlePlayCard}
                onDrawCard={handleDrawCard}
                onCallUno={handleCallUno}
              />
            </div>
            
            <div className="lg:col-span-1 flex flex-col justify-end">
              <ChatBox
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
      </main>

      <ColorPickerModal
        isOpen={showColorPicker}
        onSelectColor={handleSelectWildColor}
      />

    </div>
  );
}