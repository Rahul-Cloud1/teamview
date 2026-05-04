const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Root route (browser test)
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'TeamFlow API Running 🚀' });
});

// Health route (Railway friendly)
app.get('/health', (req, res) => res.send('OK'));

// ENV variables
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI missing in Railway variables");
  process.exit(1);
}

// MongoDB Atlas connection
console.log('🔄 Connecting to MongoDB Atlas...');

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Production API ready`);
});

// Graceful shutdown (Railway)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  server.close(() => process.exit(0));
});