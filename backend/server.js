// Import required modules
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up file upload
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

// Handle root route
app.get('/', (req, res) => {
    res.send('Welcome to the Skin Lesions App! Navigate to /upload to send files.');
});

// Handle file uploads
app.post('/upload', upload.array('images', 2), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const fileDetails = req.files.map(file => ({
        filename: file.filename,
        path: file.path
    }));

    res.json({
        message: 'Files uploaded successfully',
        files: fileDetails
    });
});

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).send('Route not found');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
