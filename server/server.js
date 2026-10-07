const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Database & Socket Engine Config Imports
const connectDB = require('./config/db');
const registerGameEngine = require('./sockets/gameEngine');

// Express Route Imports
const authRoutes = require('./routes/auth.routes');
const statsRoutes = require('./routes/stats.routes');
const uploadRoutes = require('./routes/upload.routes');

// Initialize Express App and HTTP Server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB Atlas
connectDB();

// Dynamic CORS configuration (Allows local development + production deployment)
const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173', // Default Vite Dev Server
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive CORS for cross-origin game clients
  },
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'UNO Server is healthy and running.' });
});

// Configure Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize Socket.io Real-Time Game Mechanics
registerGameEngine(io);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 UNO Server running on port ${PORT}`);
  console.log(`⚡ WebSocket Engine listening for real-time player connections...`);
});