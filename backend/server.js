const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/events');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[SOCKET.IO] Admin connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SOCKET.IO] Admin disconnected: ${socket.id}`);
  });

  socket.on('request_initial_data', async () => {
    const UserEvent = require('./models/UserEvent');
    const recentEvents = await UserEvent.find().sort({ timestamp: -1 }).limit(100);
    socket.emit('initial_data', recentEvents);
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food-ordering')
  .then(() => console.log('[DATABASE] MongoDB connected'))
  .catch(err => console.error('[DATABASE] Connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});