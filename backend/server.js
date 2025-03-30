const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Temporary placeholder routes (will implement JWT next)
app.post('/api/signup', (req, res) => {
  res.status(200).json({ message: "Signup endpoint (implement next)" });
});

app.post('/api/signin', (req, res) => {
  res.status(200).json({ message: "Signin endpoint (implement next)" });
});

// Protected Route Placeholder
app.get('/api/home', (req, res) => {
  res.status(200).json({ message: "Protected home endpoint (implement next)" });
});

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/index.html')));
app.get('/signin', (req, res) => res.sendFile(path.join(__dirname, '../frontend/signin.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '../frontend/signup.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
