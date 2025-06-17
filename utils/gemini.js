// server/utils/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = "YOUR_API_KEY_HERE"; // 🔐 Store in .env in production
const genAI = new GoogleGenerativeAI(API_KEY);

// In-memory cache
const cache = {};

async function generateCaption(tags = []) {
  const tagKey = tags.join(',');
  if (cache[tagKey]?.caption) return cache[tagKey].caption;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Funny caption for meme with tags: ${tags.join(', ')}`;
    const result = await model.generateContent(prompt);
    const caption = result.response.text().trim();

    cache[tagKey] = { ...cache[tagKey], caption };
    return caption;
  } catch (err) {
    // console.error("Caption generation failed:", err.message);
    return "YOLO to the moon!"; // Fallback
  }
}

async function generateVibe(tags = []) {
  const tagKey = tags.join(',');
  if (cache[tagKey]?.vibe) return cache[tagKey].vibe;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Describe the vibe based on these meme tags: ${tags.join(', ')}`;
    const result = await model.generateContent(prompt);
    const vibe = result.response.text().trim();

    cache[tagKey] = { ...cache[tagKey], vibe };
    return vibe;
  } catch (err) {
    // console.error("Vibe generation failed:", err.message);
    return "Retro Stonks Vibes"; // Fallback
  }
}

module.exports = { generateCaption, generateVibe };
