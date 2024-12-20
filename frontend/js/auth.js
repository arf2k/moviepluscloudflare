// Register
document.getElementById('register-btn').addEventListener('click', async () => {
     const username = document.getElementById('username').value;
     const password = document.getElementById('password').value;
   
     const response = await fetch('https://api.foremanalex.com/auth/register', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password }),
     });
   
     const result = await response.json();
     alert(result.message || result.error);
   });
   
   // Login
   document.getElementById('login-btn').addEventListener('click', async () => {
     const username = document.getElementById('username').value;
     const password = document.getElementById('password').value;
   
     const response = await fetch('https://api.foremanalex.com/auth/login', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password }),
     });
   
     const result = await response.json();
     if (result.token) {
       localStorage.setItem('authToken', result.token);
       alert('Login successful!');
     } else {
       alert(result.error);
     }
   });
   