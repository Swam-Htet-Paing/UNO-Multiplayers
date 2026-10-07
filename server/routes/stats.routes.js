const express = require('express');
const router = express.Router();
const User = require('../models/User');
const GameHistory = require('../models/GameHistory');

// GET /api/stats/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find({})
      .select('username avatarUrl stats')
      .sort({ 'stats.wins': -1 })
      .limit(10);

    res.json({ success: true, leaderboard: topPlayers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/stats/history/:userId
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await GameHistory.find({ 'players.user': req.params.userId })
      .populate('winner', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;