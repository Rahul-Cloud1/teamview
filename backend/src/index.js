const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'TeamFlow API' }));

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URL || 'mongodb://localhost:27017/teamflow';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000
})
  .then(() => {
    console.log('✓ Connected to MongoDB successfully');
  })
  .catch(err => {
    console.warn('⚠ MongoDB connection warning:', err.message);
    console.warn('Server will start without database. APIs will fail until MongoDB connects.');
  });

// Start server regardless of MongoDB connection status
app.get('/health', (req, res) => res.send('OK'));

const server = app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// Enable port reuse and handle errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('Solution: Wait a moment for the port to be released, then restart.');
    console.error('Or kill any lingering node processes: taskkill /F /IM node.exe');
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => process.exit(0));
});