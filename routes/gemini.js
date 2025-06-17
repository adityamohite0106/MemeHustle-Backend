const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const cache = {};

const geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const apiKey = process.env.GEMINI_API_KEY;

// Random fallback captions & vibes
const fallbackCaptions = [
  "When life gives you memes, you laugh.",
  "404: Logic not found.",
  "Me explaining a meme to my dog.",
  "Trust me, it's funnier at 3AM.",
  "This meme is sponsored by chaos."
];

const fallbackVibes = [
  "Chaotic Gen-Z Humor",
  "Nostalgic 90s Madness",
  "Dank Meme Energy",
  "Dystopian Irony Vibes",
  "Existential Meme Fuel"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post('/caption', async (req, res) => {
  const { tags } = req.body;
  const tagStr = tags.join(', ');

  if (cache[tagStr]) return res.json({ caption: cache[tagStr] });

  try {
    const prompt = `Funny caption for meme with tags: ${tagStr}`;
    const response = await axios.post(`${geminiEndpoint}?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const caption = response.data.candidates?.[0]?.content?.parts?.[0]?.text || getRandom(fallbackCaptions);
    cache[tagStr] = caption;
    res.json({ caption });
  } catch (err) {
    console.warn('Gemini caption fallback due to error:', err.message);
    res.json({ caption: getRandom(fallbackCaptions) });
  }
});

router.post('/vibe', async (req, res) => {
  const { tags } = req.body;
  const tagStr = tags.join(', ');

  try {
    const prompt = `Analyze the vibe of this meme with tags: ${tagStr}`;
    const response = await axios.post(`${geminiEndpoint}?key=${apiKey}`, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const vibe = response.data.candidates?.[0]?.content?.parts?.[0]?.text || getRandom(fallbackVibes);
    res.json({ vibe });
  } catch (err) {
    console.warn('Gemini vibe fallback due to error:', err.message);
    res.json({ vibe: getRandom(fallbackVibes) });
  }
});

module.exports = router;
