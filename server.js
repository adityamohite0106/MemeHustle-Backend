require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

// Routes
const memesRoute = require('./routes/memes')(io);
const bidsRoute = require('./routes/bids')(io);
const voteRoute = require('./routes/vote')(io); // <-- fixed this line
const captionRoute = require('./routes/caption')(io);

app.use('/memes', memesRoute);
app.use('/bids', bidsRoute);
app.use('/vote', voteRoute); // <-- fixed
app.use('/caption', captionRoute);

app.get('/', (req, res) => {
  res.send('✅ Meme Auction API is running');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


// adityamohite4973@gmail.com