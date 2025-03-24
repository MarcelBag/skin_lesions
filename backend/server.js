// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const express = require('express');
//const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();
const users = []; // Temporary in-memory user storage. Replace with a database in production.

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static frontend files

const SECRET_KEY = 'your-secret-key'; // Replace with a secure, randomly-generated key

// API Routes

// Sign-Up Route
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ name, email, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully!' });
});

// Sign-In Route
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Sign-in successful!', token });
});

// Protected Route Example (Home Page)
app.get('/api/home', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Welcome to the home page!' });
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
});

// Serve Index Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Serve Other Pages (Sign-In and Sign-Up Pages)
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
