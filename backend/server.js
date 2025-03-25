import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import "dotenv/config";

// Firebase configuration – if not using a bundler, replace process.env values with your config directly.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_FIREBASE_APP_ID",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "YOUR_FIREBASE_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Authentication State Listener to protect pages
onAuthStateChanged(auth, (user) => {
  // Define public pages that do not require authentication
  const publicPages = ['signin.html', 'signup.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  // If user is not logged in and current page is not public, redirect to sign in
  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = "signin.html";
  }
});

// Handle Login Button in Sign-In Form
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert('Sign-In Successful!');
      console.log('User signed in:', userCredential.user);
  
      // Redirect to home page after login
      window.location.href = "index.html";
    } catch (error) {
      console.error('Error during sign-in:', error.message);
      alert(error.message);
    }
  });
}

// Handle Sign-Up Form Submission
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name') ? document.getElementById('name').value : "";
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      alert('Sign-Up Successful!');
      console.log('User signed up:', userCredential.user);
  
      // Redirect to sign-in page after successful sign-up
      window.location.href = "signin.html";
    } catch (error) {
      console.error('Error during sign-up:', error.message);
      alert(error.message);
    }
  });
}

// Handle Image Upload Form Submission on Home Page
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const image = document.getElementById('image').files[0];
    const analysisType = document.getElementById('analysis').value;
  
    if (!image) {
      alert('Please select an image to upload.');
      return;
    }
  
    alert(`Image submitted for ${analysisType} analysis!`);
    console.log(`File: ${image.name}, Analysis Type: ${analysisType}`);
  
    // Simulate API call to handle the image upload and analysis
    // After processing, display results (here simulated)
    uploadForm.style.display = "none";
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.classList.remove('hidden');
    }
  });
}
