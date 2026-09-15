const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CampusPass API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/test-db', (req, res) => {
  try {
    const result = db.prepare("SELECT datetime('now') as current_time").get();
    res.json({ 
      message: 'Database connected!',
      time: result.current_time
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});