const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        username: String,
        rank: Number,
        cardsRemaining: Number,
      },
    ],
    totalTurns: {
      type: Number,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GameHistory', GameHistorySchema);