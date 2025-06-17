// ✅ 1. bid.js (backend/routes/bid.js)
const express = require('express');
const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  memeId: String,
  userId: String,
  credits: Number,
  createdAt: { type: Date, default: Date.now },
});

const Bid = mongoose.models.Bid || mongoose.model('Bid', BidSchema);

module.exports = (io) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { memeId, userId, credits } = req.body;

    if (!memeId || !userId || !credits) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      const bid = new Bid({ memeId, userId, credits });
      const savedBid = await bid.save();
      io.emit('new-bid', savedBid);
      res.status(201).json(savedBid);
    } catch (err) {
      res.status(500).json({ error: 'Failed to place bid' });
    }
  });

  router.get('/:memeId', async (req, res) => {
    try {
      const bids = await Bid.find({ memeId: req.params.memeId }).sort({ credits: -1 });
      res.json(bids);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch bids' });
    }
  });

  return router;
};
