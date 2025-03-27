// backend/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env
const admin = require('firebase-admin');

const app = express();

// Conditional check for FIREBASE_PRIVATE_KEY
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

if (!privateKey) {
  console.error('FIREBASE_PRIVATE_KEY is not set in the environment variables.');
  process.exit(1); // Exit the process if the key is missing
}

// Firebase Admin SDK initialization
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE || "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey, // Use the conditional variable
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Firebase Authentication API (Sign-Up)
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    res.status(201).json({ message: 'User registered successfully!', uid: userRecord.uid });
  } catch (error) {
    console.error('Sign-Up Error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Firebase Authentication API (Sign-In)
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate that the email exists
    const userRecord = await admin.auth().getUserByEmail(email);
    // Create a custom token for secure client-side authentication
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    res.status(200).json({ message: 'Sign-In successful!', token: customToken });
  } catch (error) {
    console.error('Sign-In Error:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Protected Route (Example)
app.get('/api/home', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      res.status(200).json({ message: `Welcome, ${decodedToken.email}!` });
    })
    .catch((error) => {
      console.error('Token Verification Error:', error.message);
      res.status(403).json({ message: 'Invalid or expired token.' });
    });
});

// Serve Frontend Pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
