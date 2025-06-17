const express = require('express');
const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
  memeId: String,
  user: String,
  voteType: String, // 'upvote' or 'downvote'
  createdAt: { type: Date, default: Date.now },
});

const Vote = mongoose.models.Vote || mongoose.model('Vote', VoteSchema);

module.exports = (io) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { memeId, user, voteType } = req.body;

    try {
      let existingVote = await Vote.findOne({ memeId, user });

      if (existingVote) {
        existingVote.voteType = voteType;
        await existingVote.save();
        io.emit('vote-update', existingVote);
      } else {
        const vote = new Vote({ memeId, user, voteType });
        await vote.save();
        io.emit('new-vote', vote);
      }

      // ✅ Calculate voteCount (upvotes - downvotes)
      const votes = await Vote.find({ memeId });
      const upvotes = votes.filter(v => v.voteType === 'upvote').length;
      const downvotes = votes.filter(v => v.voteType === 'downvote').length;
      const updatedVoteCount = upvotes - downvotes;

      return res.status(200).json({
        memeId,
        user,
        voteType,
        updatedVoteCount, // ✅ Send to frontend
      });
    } catch (err) {
      console.error("Vote error:", err);
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  });

  router.get('/:memeId', async (req, res) => {
    try {
      const votes = await Vote.find({ memeId: req.params.memeId });
      const upvotes = votes.filter(v => v.voteType === 'upvote').length;
      const downvotes = votes.filter(v => v.voteType === 'downvote').length;
      res.json({ upvotes, downvotes });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch votes' });
    }
  });

  return router;
};
