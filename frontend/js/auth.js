const baseAuthUrl = 'https://api.foremanalex.com/auth';

document.getElementById('register-button').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch(`${baseAuthUrl}/register`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Origin': window.location.origin 
    },
    body: JSON.stringify({ username, password })
  });

  const result = await response.json();
  alert(result.message || result.error);
});
