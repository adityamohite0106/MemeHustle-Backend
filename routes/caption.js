const express = require('express');
const mongoose = require('mongoose');

const CaptionSchema = new mongoose.Schema({
  memeId: String,
  user: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Caption = mongoose.models.Caption || mongoose.model('Caption', CaptionSchema);

module.exports = (io) => {
  const router = express.Router();

  // ✅ POST /caption → Add a new caption
  router.post('/', async (req, res) => {
    const { memeId, user, text } = req.body;

    if (!memeId || !user || !text) {
      return res.status(400).json({ error: 'memeId, user, and text are required' });
    }

    try {
      const caption = new Caption({ memeId, user, text });
      const savedCaption = await caption.save();
      io.emit('new-caption', savedCaption);
      res.status(201).json(savedCaption);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add caption' });
    }
  });

  // ✅ GET /caption/:memeId → Get all captions for a meme
  router.get('/:memeId', async (req, res) => {
    try {
      const captions = await Caption.find({ memeId: req.params.memeId }).sort({ createdAt: -1 });
      res.json(captions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch captions' });
    }
  });

  return router;
};
