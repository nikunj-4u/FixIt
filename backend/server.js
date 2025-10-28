const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Explicitly handle preflight requests
app.options('*', cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection with local and in-memory fallbacks for development
const connectDb = async () => {
  const configuredUri = process.env.MONGODB_URI || '';
  const localUri = 'mongodb://127.0.0.1:27017/fixit';

  const tryConnect = async (uri, label) => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to MongoDB (${label})`);
  };

  // 1) Try configured URI (e.g., Atlas)
  if (configuredUri) {
    try {
      await tryConnect(configuredUri, 'configured');
      return;
    } catch (e) {
      console.error('❌ Primary MongoDB connection failed:', e.message);
    }
  }

  // 2) Try local MongoDB
  try {
    await tryConnect(localUri, 'local');
    return;
  } catch (e) {
    console.error('❌ Local MongoDB connection failed:', e.message);
  }

  // 3) Fallback to in-memory MongoDB for dev
  try {
    const memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri('fixit');
    await tryConnect(memUri, 'in-memory');
    console.warn('⚠️  Using in-memory MongoDB. Data will be lost on restart.');
  } catch (e) {
    console.error('❌ In-memory MongoDB start failed:', e.message);
    process.exit(1);
  }
};



const PORT = process.env.PORT || 5001;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Fatal DB init error:', e);
    process.exit(1);
  });

module.exports = app;
