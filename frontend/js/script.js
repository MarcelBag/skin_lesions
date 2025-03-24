// Import Firebase functions and dotenv
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import "dotenv/config";

// Firebase configuration securely loaded via environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional analytics initialization
const auth = getAuth(app); // Initialize Firebase Authentication

// Export Firebase app and analytics if needed elsewhere
export { app, analytics };

// Show/Hide Sign-In Form
document.getElementById('sign-in')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form').classList.remove('hidden');
});

// Handle Login Button in Sign-In Form
document.getElementById('login-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Sign-In Successful!');
        console.log('User signed in:', userCredential.user);

        // Redirect to home page
        document.getElementById('signin-form').classList.add('hidden');
        document.getElementById('upload-section').classList.remove('hidden');
    } catch (error) {
        console.error('Error during sign-in:', error.message);
        alert(error.message);
    }
});

// Handle Sign-Up Form Submission
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('Sign-Up Successful!');
        console.log('User signed up:', userCredential.user);

        // Redirect to sign-in page
        window.location.href = "signin.html";
    } catch (error) {
        console.error('Error during sign-up:', error.message);
        alert(error.message);
    }
});

// Handle Image Upload Form Submission
document.getElementById('upload-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const image = document.getElementById('image').files[0];
    const analysisType = document.getElementById('analysis').value;

    if (!image) {
        alert('Please select an image to upload.');
        return;
    }

    alert(`Image submitted for ${analysisType} analysis!`);
    console.log(`File: ${image.name}, Analysis Type: ${analysisType}`);
    // Simulate API call to handle the image upload and analysis type
});

// Handle "Proceed to Upload" Button
document.getElementById('proceed-button')?.addEventListener('click', () => {
    document.querySelector('.guidelines').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
});

// Show Analysis Results
document.getElementById('upload-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

    alert('Image submitted for analysis!');
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');

    // Placeholder result
    document.getElementById('results-section').querySelector('p').textContent =
        'Your image has been analyzed. Results will be displayed here soon!';
});
