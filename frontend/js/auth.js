const baseWorkerUrl = 'https://api.foremanalex.com'; 

// DOM Elements
const registerButton = document.getElementById('register-btn');
const loginButton = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Register user
registerButton.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert('Username and password are required');
    return;
  }

  try {
    const response = await fetch(`${baseWorkerUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert('User registered successfully');
    } else {
      alert(data.error || 'Error registering user');
    }
  } catch (error) {
    console.error('Registration Error:', error);
    alert('Registration failed. Check console for details.');
  }
});

// Login user
loginButton.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert('Username and password are required');
    return;
  }

  try {
    const response = await fetch(`${baseWorkerUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      alert('Login successful!');
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login Error:', error);
    alert('Login failed. Check console for details.');
  }
});
