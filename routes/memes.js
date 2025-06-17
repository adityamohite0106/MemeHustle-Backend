const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

// ✅ Meme Schema (includes caption & vibe)
const MemeSchema = new mongoose.Schema({
  title: String,
  imageUrl: String,
  tags: [String],
  caption: String,
  vibe: String,
  createdAt: { type: Date, default: Date.now }
});

const Meme = mongoose.models.Meme || mongoose.model('Meme', MemeSchema);

// ✅ Gemini API KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = (io) => {
  const router = express.Router();

  // ✅ Function to generate caption & vibe using Gemini with fallback
  const generateCaptionAndVibe = async (tags = []) => {
    const tagString = tags.join(', ');
    const randomSeed = Math.floor(Math.random() * 10000);

    const promptCaption = `Generate a funny caption for a meme with tags: [${tagString}]. Seed: ${randomSeed}`;
    const promptVibe = `Describe the fun vibe of a meme with tags: [${tagString}]. Seed: ${randomSeed}`;

    const fallbackCaptions = [
      "404: Meme not found.",
      "Why is this so accurate?!",
      "This meme hits harder than reality.",
      "Proof that humor is subjective.",
      "Tag your therapist!"
    ];

    const fallbackVibes = [
      "Doomscroll Delight",
      "Post-ironic Sad Boi",
      "Viral Gen-Z Chaos",
      "Meme Magic in Motion",
      "Wholesome with a twist"
    ];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    try {
      const [captionRes, vibeRes] = await Promise.all([
        axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: promptCaption }] }]
          }
        ),
        axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: promptVibe }] }]
          }
        )
      ]);

      const caption =
        captionRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        getRandom(fallbackCaptions);

      const vibe =
        vibeRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        getRandom(fallbackVibes);

      // console.log('🎯 Gemini Caption:', caption);
      // console.log('🎯 Gemini Vibe:', vibe);

      return { caption, vibe };
    } catch (err) {
      // console.warn('⚠️ Gemini API failed:', err.message);
      return {
        caption: getRandom(fallbackCaptions),
        vibe: getRandom(fallbackVibes)
      };
    }
  };

  // ✅ POST /memes → Add new meme
  router.post('/', async (req, res) => {
    const { title, imageUrl, tags } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ error: 'Title and imageUrl are required' });
    }

    try {
      const { caption, vibe } = await generateCaptionAndVibe(tags);
      const meme = new Meme({ title, imageUrl, tags, caption, vibe });
      const savedMeme = await meme.save();

      io.emit('new-meme', savedMeme);
      res.status(201).json(savedMeme);
    } catch (err) {
      // console.error('❌ Meme creation failed:', err.message);
      res.status(500).json({ error: 'Failed to create meme' });
    }
  });

  // ✅ GET /memes → List all memes
  router.get('/', async (req, res) => {
    try {
      const memes = await Meme.find().sort({ createdAt: -1 });
      res.json(memes);
    } catch (err) {
      // console.error('❌ Fetch memes failed:', err.message);
      res.status(500).json({ error: 'Failed to fetch memes' });
    }
  });

  return router;
};
