// ---------------------------
//  Sign-Up Handler (unchanged)
// ---------------------------
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
        alert(data.message);
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

// ---------------------------
//  Sign-In Handler
// ---------------------------
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
        localStorage.setItem('token', data.token);
        alert(data.message);
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

// ---------------------------
// Home Page: Fetch and Display User Info & Setup Dropdown
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
        localStorage.removeItem('token');
        window.location.href = '/signin';
        return;
      }
      const data = await res.json();
      
      // Update header with user info
      const userAvatar = document.getElementById('user-avatar');
      if (data.profilePhoto) {
        userAvatar.innerHTML = `<img src="${data.profilePhoto}" alt="Profile Photo" style="width:100%; height:100%; border-radius:50%;">`;
      } else {
        let initials = '';
        if (data.name) {
          const nameParts = data.name.split(' ');
          if (nameParts.length === 1) {
            initials = data.name.charAt(0).toUpperCase();
          } else {
            initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
          }
        }
        userAvatar.innerText = initials;
      }
      
      // Toggle dropdown when clicking on the avatar
      userAvatar.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        userMenu.classList.toggle('hidden');
      });
      
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
// Open Settings Modal (for updating name)
// ---------------------------
const openSettingsBtn = document.getElementById('open-settings');
const settingsModal = document.getElementById('settings-modal');
if (openSettingsBtn && settingsModal) {
  openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    document.getElementById('user-menu').classList.add('hidden');
  });
}

// ---------------------------
// Close Settings Modal Handler
// ---------------------------
const closeSettingsBtn = document.getElementById('close-settings');
if (closeSettingsBtn && settingsModal) {
  closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });
}

// ---------------------------
// Update Name Handler (within settings modal)
// ---------------------------
const updateNameBtn = document.getElementById('update-name');
if (updateNameBtn) {
  updateNameBtn.addEventListener('click', async () => {
    const newNameInput = document.getElementById('new-name');
    const newName = newNameInput.value.trim();
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
        const userAvatar = document.getElementById('user-avatar');
        let initials = '';
        const nameParts = newName.split(' ');
        if (nameParts.length === 1) {
          initials = newName.charAt(0).toUpperCase();
        } else {
          initials = nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
        userAvatar.innerText = initials;
        newNameInput.value = '';
        settingsModal.classList.add('hidden');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Update failed.");
    }
  });
}
