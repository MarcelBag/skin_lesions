const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes
// Serve the frontend's index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html')); // Corrected path
});

// Serve the frontend's signup.html for the root URL
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

// Serve the frontend's signin.html for the root URL
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});

// Serve the frontend's home.html for the root URL
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/home.html'));
});


// Handle file upload
app.post('/api/upload', upload.single('image'), (req, res) => {
    res.json({ message: 'Image uploaded successfully', analysis: req.body.analysis });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
