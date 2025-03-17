const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
app.post('/upload', upload.array('images', 2), (req, res) => {
    res.send('Files uploaded successfully');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
