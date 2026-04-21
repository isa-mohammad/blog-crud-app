require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { connectToDB } = require('./config/db');

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Blog CRUD API',
    status: 'running',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      comments: '/api/comments',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;

connectToDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
