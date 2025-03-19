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
