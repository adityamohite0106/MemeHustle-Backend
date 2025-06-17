// models/Meme.js
const mongoose = require('mongoose');

const MemeSchema = new mongoose.Schema({
  imageUrl: String,
  tags: [String],
  uploader: String,
  caption: String,
  vibe: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meme', MemeSchema);
