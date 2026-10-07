module.exports = (io, socket, roomStore) => {
  // Send message event
  socket.on('send_message', ({ roomId, message }) => {
    const room = roomStore.get(roomId);
    if (!room) return;

    const sender = room.players.find((p) => p.socketId === socket.id);
    const chatMsg = {
      sender: socket.id,
      username: sender ? sender.username : 'System',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.messages = room.messages || [];
    room.messages.push(chatMsg);

    // Keep chat history under 50 messages
    if (room.messages.length > 50) room.messages.shift();

    io.to(roomId).emit('new_message', chatMsg);
  });
};