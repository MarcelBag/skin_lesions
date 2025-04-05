const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer'); // For handling file uploads
const { exec } = require('child_process'); // To run the Python model
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User'); // Mongoose User model

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));


const corsOptions = {
    origin: 'http://localhost:3000', // Allow only the frontend to access the backend
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  app.use(cors(corsOptions));
  

// ===========================
//   File upload setup with multer
// ===========================
const upload = multer({ dest: 'uploads/' }); // Save uploaded files to 'uploads' directory

// ===========================
//   Signup Route
// ===========================
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please sign in instead.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// ===========================
//   Signin Route
// ===========================
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ message: 'Signin successful!', token });
  } catch (err) {
    console.error('Signin error:', err.message);
    res.status(500).json({ message: 'Server error during signin.' });
  }
});

// ===========================
//   Auth Middleware
// ===========================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, unauthorized.' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

// ===========================
// Image Upload and Prediction Route (Flask API Integration)
// ===========================
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1]; // Extract JWT from request headers
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded.' });
      }
  
      const formData = new FormData();
      formData.append('image', fs.createReadStream(req.file.path));  // Send image to Flask API
  
      // Send image to the Flask API for prediction
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Handle Flask response
      const prediction = response.data.prediction;
      const confidence = response.data.confidence;
  
      // Send prediction data back to the frontend
      res.json({
        prediction: prediction,
        confidence: confidence,
        analysisType: req.body['analysis-type'] || 'Unknown'
      });
  
    } catch (error) {
      console.error('Error during image upload or prediction:', error);
      res.status(500).json({ message: 'Error analyzing the image.' });
    }
  });
  


// ===========================
//   Protected Route
// ===========================
app.get('/api/home', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Welcome to home, ${req.user.email}!` });
});

// ---------------------------
// Get current user info (protected)
// ---------------------------
app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ name: user.name, email: user.email });
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------------------
// Update current user's name (protected)
// ---------------------------
app.put('/api/user', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.name = name;
    await user.save();
    res.status(200).json({ message: "User updated successfully!", name: user.name });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ===========================
//   Get All Users (Admin only)
// ===========================
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.status(200).json(users); // Return the users as a JSON response
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// ===========================
//   Edit User (Admin only)
// ===========================
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    user.name = name;
    user.email = email;
    await user.save();

    res.status(200).json({ message: 'User updated successfully!' });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ message: 'Server error updating user.' });
  }
});

// ===========================
//   Delete User (Admin only)
// ===========================
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete the user by id
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

// ===========================
//   Image Upload Route (New)
// ===========================
app.post('/api/upload-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const imagePath = path.join(__dirname, 'uploads', req.file.filename);
    const analysisType = req.body['analysis-type']; // 'benign' or 'malignant'
    
    // Call the Python model to analyze the image
    const result = await analyzeImage(imagePath, analysisType);
    
    res.status(200).json({
      prediction: result.prediction,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('Error during image analysis:', error);
    res.status(500).json({ message: 'Error analyzing the image.' });
  }
});

// Function to run the Python model for image analysis
function analyzeImage(imagePath, analysisType) {
  return new Promise((resolve, reject) => {
    exec(`python3 analyze_image.py --image ${imagePath} --analysis ${analysisType}`, (error, stdout, stderr) => {
      if (error) {
        reject('Error executing Python model: ' + stderr);
        return;
      }
      const result = JSON.parse(stdout);
      resolve(result);
    });
  });
}

// ===========================
//   Serve Frontend Pages
// ===========================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signin.html'));
});
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
