const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const User = require('../models/User');

// POST /api/upload/avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const avatarUrl = req.file.path; // Cloudinary secure URL

    if (userId && !userId.startsWith('guest_')) {
      await User.findByIdAndUpdate(userId, { avatarUrl });
    }

    res.json({
      success: true,
      avatarUrl,
      message: 'Avatar uploaded to object storage successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;