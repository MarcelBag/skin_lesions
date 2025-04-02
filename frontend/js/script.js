document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------
    // Sign-Up Handler
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
    // Sign-In Handler
    // ---------------------------
    if (window.location.pathname === '/signin') {
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
              localStorage.setItem('token', data.token);  // Store the token in localStorage
              alert(data.message);
              window.location.href = '/home';  // Redirect to home after successful signin
            } else {
              alert(data.message);  // Show error message if signin fails
            }
          } catch (error) {
            console.error('Signin Error:', error);
            alert('Something went wrong during signin.');
          }
        });
      }
    }
  
    // ---------------------------
    // Home Page Logic (/home)
    // ---------------------------
    if (window.location.pathname === '/home') {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/signin';  // Redirect to signin if not logged in
        return;
      }
  
      // Fetch and display user info in header (update avatar)
      (async () => {
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
      })();
  
      // Sign Out Handler
      const signOutBtn = document.getElementById('sign-out');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
          localStorage.removeItem('token');
          window.location.href = '/signin';
        });
      }
  
      // Open Settings Modal Handler
      const openSettingsBtn = document.getElementById('open-settings');
      const settingsModal = document.getElementById('settings-modal');
      if (openSettingsBtn && settingsModal) {
        openSettingsBtn.addEventListener('click', () => {
          // Change the URL fragment to #settings to show modal
          window.location.hash = '#settings';
        });
      }
  
      // Close Settings Modal Handler (click on "X")
      const closeSettingsBtn = document.getElementById('close-settings');
      if (closeSettingsBtn && settingsModal) {
        closeSettingsBtn.addEventListener('click', () => {
          // Reset the URL fragment and hide the modal
          window.location.hash = '';
        });
      }
  
      // Listen for URL hash changes to show/hide modal
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash === '#settings') {
          settingsModal.classList.remove('hidden');  // Show the modal
        } else {
          settingsModal.classList.add('hidden');  // Hide the modal
        }
      });
  
      // ---------------------------
      // Update Name Handler (inside settings modal)
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
              // Update avatar with new initials
              const userAvatar = document.getElementById('user-avatar');
              let initials = '';
              const nameParts = newName.split(' ');
              initials = nameParts.length === 1
                ? nameParts[0].charAt(0).toUpperCase()
                : nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
              userAvatar.innerText = initials;
              newNameInput.value = '';
              // Close the modal after name update
              window.location.hash = '';  // This will remove the hash and hide the modal
            } else {
              alert(data.message);
            }
          } catch (error) {
            console.error("Update error:", error);
            alert("Update failed.");
          }
        });
      }
  
      // Optional: Theme Selector Handler
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) {
        themeSelect.addEventListener('change', () => {
          if (themeSelect.value === 'dark') {
            document.body.classList.add('dark-theme');
          } else {
            document.body.classList.remove('dark-theme');
          }
        });
      }
    }
  });
  