// Import and initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';


// Show/Hide Sign-in Form
document.getElementById('sign-in').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form').classList.remove('hidden');
});

// Handle Login
document.getElementById('login-btn').addEventListener('click', () => {
    document.getElementById('signin-form').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
});

// Handle Image Upload Form
document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const image = document.getElementById('image').files[0];
    const analysisType = document.getElementById('analysis').value;

    if (image) {
        alert(`Image submitted for ${analysisType} analysis!`);
        // Add your API call to send the file and analysis type here.
    } else {
        alert('Please select an image to upload.');
    }
});

// Redirect to Sign-In Page
document.getElementById('sign-in').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = "signin.html";
});


// Handle "Proceed to Upload" Button
document.getElementById('proceed-button').addEventListener('click', () => {
    document.querySelector('.guidelines').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
});

// Handle Image Upload Form Submission
document.getElementById('upload-form').addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate image analysis process
    alert('Image submitted for analysis!');
    
    // Hide upload section and show results section
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');

    // Placeholder for showing results
    document.getElementById('results-section').querySelector('p').textContent =
        'Your image has been analyzed. Results will be displayed here soon!';
});
