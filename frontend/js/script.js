// frontend/JS/script.js

// ===========================
//  Sign-Up Handler
// ===========================
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message); // "User created successfully!"
        window.location.href = '/signin';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signup Error:', error);
      alert('Something went wrong during signup.');
    }
  });
}

// ===========================
//  Sign-In Handler
// ===========================
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
  loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // Save token (e.g., localStorage)
        localStorage.setItem('token', data.token);
        alert(data.message); // "Signin successful!"
        window.location.href = '/home';
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signin Error:', error);
      alert('Something went wrong during signin.');
    }
  });
}

// ===========================
//  Home Page (Protected)
// ===========================
document.addEventListener('DOMContentLoaded', async () => {
  // if you're on the home page, you can verify token
  if (window.location.pathname === '/home') {
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in
      window.location.href = '/signin';
    } else {
      // Attempt to call /api/home to verify
      try {
        const res = await fetch('/api/home', {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        const data = await res.json();
        if (!res.ok) {
          // If token invalid or expired
          alert(data.message); 
          localStorage.removeItem('token');
          window.location.href = '/signin';
        } else {
          console.log(data.message); 
          // e.g. "Welcome to home, user@example.com!"
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        window.location.href = '/signin';
      }
    }
  }
});
// frontend/JS/script.js

// ---------------------------
// On Home page, fetch and display user info
// ---------------------------
document.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname === '/home') {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';
        return;
      }
      try {
        const res = await fetch('/api/user', {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
          // If token invalid or expired
          localStorage.removeItem('token');
          window.location.href = '/signin';
          return;
        }
        const data = await res.json();
        document.getElementById('user-name').innerText = data.name;
        document.getElementById('user-email').innerText = data.email;
      } catch (error) {
        console.error("Error fetching user info:", error);
        window.location.href = '/signin';
      }
    }
  });
  
  // ---------------------------
  // Sign Out Handler
  // ---------------------------
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    });
  }
  
  // ---------------------------
  // Update Name Handler
  // ---------------------------
  const updateNameBtn = document.getElementById('update-name');
  if (updateNameBtn) {
    updateNameBtn.addEventListener('click', async () => {
      const newName = document.getElementById('new-name').value;
      if (!newName) {
        alert("Please enter a new name.");
        return;
      }
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/user', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify({ name: newName })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          document.getElementById('user-name').innerText = data.name;
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Update error:", error);
        alert("Update failed.");
      }
    });
  });
  