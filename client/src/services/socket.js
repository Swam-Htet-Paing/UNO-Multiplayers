import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initializes or returns the existing Socket.io connection.
 * @param {Object} authOptions Optional authentication metadata (token, userId, username)
 */
export const initSocket = (authOptions = {}) => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: authOptions,
    });
  }
  return socket;
};

/**
 * Gets the current active socket instance.
 */
export const getSocket = () => socket;

/**
 * Connects the socket to the server.
 */
export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

/**
 * Disconnects the active socket.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/* ==========================================================================
   Outbound Socket Event Helpers (Client -> Server)
   ========================================================================== */

export const createRoom = (roomConfig) => {
  // roomConfig: { roomId, isPrivate, password, maxPlayers, user }
  if (socket) socket.emit('create_room', roomConfig);
};

export const joinRoom = (roomCredentials) => {
  // roomCredentials: { roomId, password, user }
  if (socket) socket.emit('join_room', roomCredentials);
};

export const startGame = (roomId) => {
  if (socket) socket.emit('start_game', { roomId });
};

export const playCard = (roomId, card, chosenColor) => {
  if (socket) socket.emit('play_card', { roomId, card, chosenColor });
};

export const drawCard = (roomId) => {
  if (socket) socket.emit('draw_card', { roomId });
};

export const callUno = (roomId) => {
  if (socket) socket.emit('call_uno', { roomId });
};

export const sendChatMessage = (roomId, message) => {
  if (socket) socket.emit('send_message', { roomId, message });
};

/* ==========================================================================
   Inbound Socket Event Subscriptions (Server -> Client)
   ========================================================================== */

export const subscribeToRoomUpdates = (callback) => {
  if (!socket) return;
  socket.on('room_updated', callback);
  return () => socket.off('room_updated', callback);
};

export const subscribeToGameState = (callback) => {
  if (!socket) return;
  socket.on('game_state_update', callback);
  socket.on('game_started', callback);
  return () => {
    socket.off('game_state_update', callback);
    socket.off('game_started', callback);
  };
};

export const subscribeToChat = (callback) => {
  if (!socket) return;
  socket.on('new_message', callback);
  return () => socket.off('new_message', callback);
};

export const subscribeToGameErrors = (callback) => {
  if (!socket) return;
  socket.on('error_message', callback);
  return () => socket.off('error_message', callback);
};