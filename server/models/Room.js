const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    maxPlayers: {
      type: Number,
      default: 4,
      min: 2,
      max: 4,
    },
    gameState: {
      type: String,
      enum: ['LOBBY', 'PLAYING', 'FINISHED'],
      default: 'LOBBY',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', RoomSchema);