const { createDeck, shuffle } = require('../utils/deck');
const GameHistory = require('../models/GameHistory');
const User = require('../models/User');

// Active rooms in-memory state map
const rooms = new Map();

module.exports = (io) => {
  const registerChatHandler = require('./chatHandler');

  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Register Chat module with shared room store
    registerChatHandler(io, socket, rooms);

    emitPublicRoomsList(socket); // 1. Instantly send current public rooms to newly connected player
    socket.on('get_public_rooms', () => emitPublicRoomsList(socket));

    // --- CREATE ROOM ---
    socket.on('create_room', ({ roomId, isPrivate, password, maxPlayers = 4, user }) => {
      const formattedRoomId = roomId.toUpperCase().trim();

      const room = {
        id: formattedRoomId,
        isPrivate: !!isPrivate,
        password: password || null,
        maxPlayers: Number(maxPlayers),
        host: socket.id,
        hostName: user?.username || 'Player 1',
        players: [],
        deck: [],
        discardPile: [],
        currentTurn: 0,
        direction: 1, // 1 = Clockwise, -1 = Counter-Clockwise
        currentColor: null,
        gameState: 'LOBBY',
        messages: []
      };

      rooms.set(formattedRoomId, room);
      socket.join(formattedRoomId);

      room.players.push({
        socketId: socket.id,
        userId: user?._id || `guest_${socket.id}`,
        username: user?.username || 'Host',
        avatarUrl: user?.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png',
        hand: [],
        saidUno: false
      });

      io.to(formattedRoomId).emit('room_updated', sanitizeRoom(room));
      emitPublicRoomsList(io);
    });

    // --- JOIN ROOM ---
    socket.on('join_room', ({ roomId, password, user }) => {
      const formattedRoomId = roomId.toUpperCase().trim();
      const room = rooms.get(formattedRoomId);

      if (!room) return socket.emit('error_message', 'Room not found.');
      if (room.isPrivate && room.password !== password) {
        return socket.emit('error_message', 'Incorrect room password.');
      }
      if (room.players.length >= room.maxPlayers) {
        return socket.emit('error_message', 'Room is full.');
      }
      if (room.gameState !== 'LOBBY') {
        return socket.emit('error_message', 'Game is already in progress.');
      }

      socket.join(formattedRoomId);

      const existingPlayer = room.players.find((p) => p.socketId === socket.id);
      if (!existingPlayer) {
        room.players.push({
          socketId: socket.id,
          userId: user?._id || `guest_${socket.id}`,
          username: user?.username || `Player ${room.players.length + 1}`,
          avatarUrl: user?.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png',
          hand: [],
          saidUno: false
        });
      }

      io.to(formattedRoomId).emit('room_updated', sanitizeRoom(room));
      emitPublicRoomsList(io);
    });

    // --- START GAME ---
    socket.on('start_game', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.host !== socket.id) return;

      room.deck = createDeck();
      room.discardPile = [];
      room.gameState = 'PLAYING';
      room.direction = 1;
      room.currentTurn = 0;

      // Deal 7 cards per player
      room.players.forEach((player) => {
        player.hand = room.deck.splice(0, 7);
        player.saidUno = false;
      });

      // Set valid starting top card
      let firstCard = room.deck.pop();
      while (firstCard.value === 'wild_draw4') {
        room.deck.unshift(firstCard);
        firstCard = room.deck.pop();
      }

      room.discardPile.push(firstCard);
      room.currentColor = firstCard.color === 'wild' ? 'red' : firstCard.color;

      io.to(roomId).emit('game_started', sanitizeRoom(room));
      emitPublicRoomsList(io);
    });

    // --- PLAY CARD ---
    socket.on('play_card', ({ roomId, card, chosenColor }) => {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== 'PLAYING') return;

      const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);
      if (playerIndex !== room.currentTurn) {
        return socket.emit('error_message', "It's not your turn!");
      }

      const player = room.players[playerIndex];
      const topCard = room.discardPile[room.discardPile.length - 1];

      // Validate move
      const isValid =
        card.color === 'wild' ||
        card.color === room.currentColor ||
        card.value === topCard.value;

      if (!isValid) return socket.emit('error_message', 'Illegal move!');

      // Remove played card from hand and place on top of discard pile
      player.hand = player.hand.filter((c) => c.id !== card.id);
      room.discardPile.push(card);
      room.currentColor = card.color === 'wild' ? chosenColor : card.color;

      // Reset UNO status if player has more than 1 card
      if (player.hand.length !== 1) player.saidUno = false;

      // Win Condition Check
      if (player.hand.length === 0) {
        room.gameState = 'FINISHED';
        io.to(roomId).emit('game_over', { winner: player });

        // Record Match in MongoDB if valid IDs exist
        if (!player.userId.startsWith('guest_')) {
          User.findByIdAndUpdate(player.userId, { $inc: { 'stats.wins': 1, 'stats.gamesPlayed': 1 } }).catch(() => {});
          GameHistory.create({
            roomId,
            winner: player.userId,
            players: room.players.map((p, idx) => ({ user: p.userId, username: p.username, rank: p.socketId === socket.id ? 1 : idx + 2, cardsRemaining: p.hand.length }))
          }).catch(() => {});
        }
        return;
      }

      // Action Cards Logic
      let step = 1;
      if (card.value === 'skip') step = 2;
      if (card.value === 'reverse') {
        room.direction *= -1;
        if (room.players.length === 2) step = 2;
      }
      if (card.value === 'draw2') {
        const nextIdx = getNextIndex(room, 1);
        drawCardsForPlayer(room, room.players[nextIdx], 2);
        step = 2;
      }
      if (card.value === 'wild_draw4') {
        const nextIdx = getNextIndex(room, 1);
        drawCardsForPlayer(room, room.players[nextIdx], 4);
        step = 2;
      }

      room.currentTurn = getNextIndex(room, step);
      io.to(roomId).emit('game_state_update', sanitizeRoom(room));
    });

    // --- DRAW CARD ---
    socket.on('draw_card', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.gameState !== 'PLAYING') return;

      const player = room.players[room.currentTurn];
      if (player.socketId !== socket.id) return;

      drawCardsForPlayer(room, player, 1);
      room.currentTurn = getNextIndex(room, 1);
      io.to(roomId).emit('game_state_update', sanitizeRoom(room));
    });

    // --- CALL UNO ---
    socket.on('call_uno', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find((p) => p.socketId === socket.id);
      if (player && player.hand.length === 1) {
        player.saidUno = true;
        io.to(roomId).emit('game_state_update', sanitizeRoom(room));
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        const idx = room.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            if (room.host === socket.id) room.host = room.players[0].socketId;
            if (room.currentTurn >= room.players.length) room.currentTurn = 0;
            io.to(roomId).emit('room_updated', sanitizeRoom(room));
          }
          emitPublicRoomsList(io);
        }
      });
    });
  });
};

/* Helper Functions */
function getNextIndex(room, step = 1) {
  const total = room.players.length;
  return (room.currentTurn + step * room.direction + total * 100) % total;
}

function drawCardsForPlayer(room, player, amount) {
  for (let i = 0; i < amount; i++) {
    if (room.deck.length === 0) {
      const top = room.discardPile.pop();
      room.deck = shuffle(room.discardPile);
      room.discardPile = [top];
    }
    if (room.deck.length > 0) {
      player.hand.push(room.deck.pop());
    }
  }
}

function sanitizeRoom(room) {
  return {
    id: room.id,
    isPrivate: room.isPrivate,
    maxPlayers: room.maxPlayers,
    host: room.host,
    hostName: room.hostName,
    players: room.players,
    discardPile: room.discardPile,
    currentTurn: room.currentTurn,
    direction: room.direction,
    currentColor: room.currentColor,
    gameState: room.gameState,
    messages: room.messages
  };
}

function emitPublicRoomsList(target) {
  const publicRooms = [];
  rooms.forEach((room) => {
    if (!room.isPrivate) {
      publicRooms.push({
        id: room.id,
        hostName: room.hostName,
        isPrivate: room.isPrivate,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        gameState: room.gameState
      });
    }
  });
  target.emit('public_rooms_list', publicRooms);
}