// Small account layer for the single-app demo.
window.currentUser = null;

const authGate = document.getElementById('authGate');
const authMessage = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authToggle = document.getElementById('authToggle');

function showAuthMessage(message, good = false) {
  authMessage.textContent = message || '';
  authMessage.style.color = good ? 'var(--easy)' : 'var(--hard)';
}

function setAuthMode(mode) {
  const registering = mode === 'register';
  loginForm.style.display = registering ? 'none' : 'flex';
  registerForm.style.display = registering ? 'flex' : 'none';
  document.getElementById('authTitle').textContent = registering ? 'Create your account' : 'Welcome back';
  document.getElementById('authSubtitle').textContent = registering
    ? 'Your progress, notes, mistakes, and applications will be stored separately.'
    : 'Sign in to keep your preparation data attached to your account.';
  authToggle.textContent = registering ? 'Already have an account? Sign in' : 'Need an account? Create one';
  showAuthMessage('');
}

async function sendAuth(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Authentication failed.');
  return data;
}

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
    const data = await response.json();
    if (data.authenticated) {
      window.currentUser = data.user;
      authGate.classList.add('hidden');
      const label = document.getElementById('authUserLabel');
      if (label) label.textContent = `signed in as ${data.user.username}`;
      return true;
    }
  } catch (error) {
    showAuthMessage('Cannot reach the server. Start the app with npm start.');
  }
  return false;
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  showAuthMessage('Signing in…', true);
  try {
    await sendAuth('/api/auth/login', {
      username: document.getElementById('loginUsername').value,
      password: document.getElementById('loginPassword').value
    });
    window.location.reload();
  } catch (error) { showAuthMessage(error.message); }
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  showAuthMessage('Creating account…', true);
  try {
    await sendAuth('/api/auth/register', {
      username: document.getElementById('registerUsername').value,
      password: document.getElementById('registerPassword').value
    });
    window.location.reload();
  } catch (error) { showAuthMessage(error.message); }
});

authToggle.addEventListener('click', () => {
  setAuthMode(registerForm.style.display === 'none' ? 'register' : 'login');
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.reload();
});

window.authReady = checkAuth();
