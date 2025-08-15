const API_URL = 'http://localhost:4000/api';

const authContainer = document.getElementById('auth-container');
const profileContainer = document.getElementById('profile-container');
const authForm = document.getElementById('auth-form');
const toggleLink = document.getElementById('toggle-link');
const toggleMessage = document.getElementById('toggle-message');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const logoutBtn = document.getElementById('logout-btn');
const profileInfo = document.getElementById('profile-info');

let isLogin = false;

function updateUI() {
  if (localStorage.getItem('token')) {
    authContainer.classList.add('d-none');
    profileContainer.classList.remove('d-none');
  } else {
    authContainer.classList.remove('d-none');
    profileContainer.classList.add('d-none');
  }
}

function switchMode() {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? 'Login' : 'Register';
  submitBtn.textContent = isLogin ? 'Login' : 'Register';
  toggleMessage.textContent = isLogin ? "Don't have an account?" : 'Already have an account?';
  toggleLink.textContent = isLogin ? 'Register' : 'Login';
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!username || !password) return;
  try {
    const res = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    localStorage.setItem('token', data.token);
    await loadProfile();
    updateUI();
  } catch (err) {
    alert(err.message);
  }
});

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  switchMode();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  updateUI();
});

async function loadProfile() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error('Could not fetch profile');
    profileInfo.textContent = `Hello, ${data.username}!`;
  } catch (err) {
    console.error(err);
  }
}

// Initial setup
updateUI();
if (localStorage.getItem('token')) {
  loadProfile();
}