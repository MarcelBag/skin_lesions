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
  

/* ===========================
Admin panel
==============================
*/

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin';  // Ensure admin is logged in
        return;
    }

    // Admin Panel Logic
    const viewUsersBtn = document.getElementById('view-users');
    const uploadImageBtn = document.getElementById('upload-image');
    const viewImagesBtn = document.getElementById('view-images');
    const sidebar = document.querySelector('aside');
    const sidebarToggleBtn = document.getElementById('toggle-sidebar');

    // Show users list
    if (viewUsersBtn) {
        viewUsersBtn.addEventListener('click', async () => {
            const res = await fetch('/api/users', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (res.ok) {
                let usersTable = '<table><tr><th>Name</th><th>Email</th><th>Actions</th></tr>';
                data.forEach(user => {
                    usersTable += `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>
                                <button onclick="editUser('${user._id}')">Edit</button>
                                <button onclick="deleteUser('${user._id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                usersTable += '</table>';
                document.getElementById('main-content').innerHTML = usersTable;
            } else {
                alert(data.message);
            }
        });
    }

    // Upload Image
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => {
            document.getElementById('main-content').innerHTML = `
                <h2>Upload Image for Analysis</h2>
                <form id="upload-form">
                    <input type="file" name="image" id="image" required>
                    <button type="submit">Upload</button>
                </form>
            `;
            const uploadForm = document.getElementById('upload-form');
            uploadForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const image = document.getElementById('image').files[0];
                const formData = new FormData();
                formData.append('image', image);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });
                const data = await res.json();
                alert(data.message);
            });
        });
    }

    // View uploaded images
    if (viewImagesBtn) {
        viewImagesBtn.addEventListener('click', async () => {
            const res = await fetch('/api/images', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (res.ok) {
                let imagesList = '<h2>Uploaded Images</h2><ul>';
                data.forEach(image => {
                    imagesList += `<li><img src="${image.url}" alt="Image" width="100" height="100"></li>`;
                });
                imagesList += '</ul>';
                document.getElementById('main-content').innerHTML = imagesList;
            } else {
                alert(data.message);
            }
        });
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/signin';
        });
    }

    // Sidebar toggle functionality
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden'); // Toggle sidebar visibility
        updateSidebarButton(); // Update the button icon
    });

    // Function to update the sidebar toggle button icon
    function updateSidebarButton() {
        if (sidebar.classList.contains('hidden')) {
            sidebarToggleBtn.innerHTML = '☰'; // Hamburger icon (for closed sidebar)
        } else {
            sidebarToggleBtn.innerHTML = '×'; // Close icon (for open sidebar)
        }
    }
    
    // Initial sidebar button icon state
    updateSidebarButton();
});

// Functions for user editing and deleting
function editUser(userId) {
    // Logic to edit a user (modal form)
    const modalContent = `
        <h3>Edit User</h3>
        <form id="edit-user-form">
            <label for="edit-name">Name:</label>
            <input type="text" id="edit-name" required />
            <label for="edit-email">Email:</label>
            <input type="email" id="edit-email" required />
            <button type="submit">Update User</button>
        </form>
    `;
    document.getElementById('main-content').innerHTML = modalContent;

    const form = document.getElementById('edit-user-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('edit-name').value;
        const email = document.getElementById('edit-email').value;

        const token = localStorage.getItem('token');
        const res = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify({ name, email }),
        });
        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            window.location.href = '/admin'; // Reload the admin panel page
        } else {
            alert(data.message);
        }
    });
}

function deleteUser(userId) {
    const token = localStorage.getItem('token');
    fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                window.location.href = '/admin'; // Reload the admin panel page
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting user.');
        });
}
