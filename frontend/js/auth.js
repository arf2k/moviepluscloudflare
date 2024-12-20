const baseAuthUrl = 'https://api.foremanalex.com/auth';

document.getElementById('register-button').addEventListener('click', async () => {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	const response = await fetch(`${baseAuthUrl}/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});

	const result = await response.text();
	alert(result);
});

document.getElementById('login-button').addEventListener('click', async () => {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	const response = await fetch(`${baseAuthUrl}/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});

	const { token } = await response.json();
	localStorage.setItem('jwt', token);
	alert('Logged in successfully! Token stored in localStorage.');
});
