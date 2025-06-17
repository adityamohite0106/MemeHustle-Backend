// ✅ 2. leaderboard.js (backend/routes/leaderboard.js)
const express = require('express');
const Vote = require('../models/Vote');

module.exports = () => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const allVotes = await Vote.find();

      const memeVotesMap = {};
      allVotes.forEach((vote) => {
        if (!memeVotesMap[vote.memeId]) memeVotesMap[vote.memeId] = 0;
        if (vote.voteType === 'upvote') memeVotesMap[vote.memeId] += 1;
        if (vote.voteType === 'downvote') memeVotesMap[vote.memeId] -= 1;
      });

      const sorted = Object.entries(memeVotesMap)
        .map(([memeId, score]) => ({ memeId, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      res.json(sorted);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load leaderboard' });
    }
  });

  return router;
};