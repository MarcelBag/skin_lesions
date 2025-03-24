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

// Firebase configuration (Environment Variables via dotenv-webpack in production)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


const app = express();
const users = []; // Temporary in-memory user storage. Replace with a database in production.

// Initialize Firebase and Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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


// Handle Sign-Up Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign up user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Sign-Up Successful!');
        console.log('User signed up:', userCredential.user);

        // Redirect to the Sign-In page
        window.location.href = 'signin.html';
    } catch (error) {
        console.error('Error during sign-up:', error.message);
        alert(error.message);
    }
});

// Handle Sign-In Form Submission
document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in user with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Sign-In Successful!');
        console.log('User signed in:', userCredential.user);

        // Save token or redirect to home page
        localStorage.setItem('authToken', userCredential.user.accessToken);
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error during sign-in:', error.message);
        alert(error.message);
    }
});



// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
