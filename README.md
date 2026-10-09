const state = {
  token: localStorage.getItem('instagramSchedulerToken') || '',
  user: null,
  accounts: [],
  publications: []
};

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function renderAuth() {
  const loggedIn = Boolean(state.token);
  document.getElementById('authSection').classList.toggle('hidden', loggedIn);
  document.getElementById('dashboardSection').classList.toggle('hidden', !loggedIn);
  document.getElementById('logoutBtn').classList.toggle('hidden', !loggedIn);

  if (loggedIn && state.user) {
    document.getElementById('welcomeText').textContent = `Bienvenue, ${state.user.email}`;
  }
}

function renderSummary(summary = {}) {
  const boxes = [
    { label: 'Total', value: summary.total || 0 },
    { label: 'En attente', value: summary.scheduled || 0 },
    { label: 'Publiées', value: summary.published || 0 },
    { label: 'Échouées', value: summary.failed || 0 }
  ];

  const summaryContainer = document.getElementById('summaryBoxes');
  summaryContainer.innerHTML = boxes.map((box) => `
    <div class="summary-box">
      <div class="muted">${box.label}</div>
      <div class="value">${box.value}</div>
    </div>
  `).join('');
}

function renderAccounts() {
  const select = document.getElementById('postAccountSelect');
  select.innerHTML = state.accounts.map((account) => `
    <option value="${account.id}">${account.username}</option>
  `).join('');
}

function renderCalendar() {
  const calendar = document.getElementById('calendarGrid');
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  calendar.innerHTML = '';

  dayNames.forEach((day) => {
    const el = document.createElement('div');
    el.className = 'day-name';
    el.textContent = day;
    calendar.appendChild(el);
  });

  const startIndex = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startIndex + lastDay.getDate()) / 7) * 7;

  const countsByDay = new Map();
  state.publications.forEach((post) => {
    const date = new Date(post.scheduledAt);
    if (date.getMonth() === month && date.getFullYear() === year) {
      const key = date.getDate();
      countsByDay.set(key, (countsByDay.get(key) || 0) + 1);
    }
  });

  for (let i = 0; i < totalCells; i++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'day-cell';

    const dayNumber = i - startIndex + 1;
    if (dayNumber <= 0 || dayNumber > lastDay.getDate()) {
      dayCell.classList.add('muted');
      dayCell.textContent = '';
    } else {
      const count = countsByDay.get(dayNumber) || 0;
      dayCell.classList.toggle('has-posts', count > 0);
      dayCell.innerHTML = `<div class="day-number">${dayNumber}</div><div class="day-count">${count ? `${count} post${count > 1 ? 's' : ''}` : ''}</div>`;
    }

    calendar.appendChild(dayCell);
  }
}

function renderPosts() {
  const list = document.getElementById('postList');

  if (!state.publications.length) {
    list.innerHTML = '<li class="post-item"><p class="muted">Aucune publication pour le moment.</p></li>';
    return;
  }

  list.innerHTML = state.publications.map((post) => `
    <li class="post-item">
      <div class="meta">
        <strong>${post.accountUsername || 'Compte'}</strong>
        <span class="status-pill ${post.status}">${post.status}</span>
      </div>
      <p class="muted">${new Date(post.scheduledAt).toLocaleString()}</p>
      <p>${post.caption || 'Aucune légende.'}</p>
      <p class="muted">${post.mediaUrl || 'Aucun média'}</p>
      ${post.lastError ? `<p class="muted">Erreur: ${post.lastError}</p>` : ''}
    </li>
  `).join('');
}

async function loadUser() {
  try {
    const user = await api('/auth/me');
    state.user = user;
    renderAuth();
    await Promise.all([loadAccounts(), loadPublications(), loadSummary()]);
  } catch (error) {
    state.token = '';
    state.user = null;
    localStorage.removeItem('instagramSchedulerToken');
    renderAuth();
  }
}

async function loadAccounts() {
  try {
    state.accounts = await api('/accounts');
    renderAccounts();
  } catch (error) {
    console.error(error);
  }
}

async function loadPublications() {
  try {
    state.publications = await api('/publications');
    renderPosts();
    renderCalendar();
  } catch (error) {
    console.error(error);
  }
}

async function loadSummary() {
  try {
    const summary = await api('/publications/summary');
    renderSummary(summary);
  } catch (error) {
    console.error(error);
  }
}

async function registerUser() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  try {
    const result = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = result.token;
    state.user = result.user;
    localStorage.setItem('instagramSchedulerToken', result.token);
    renderAuth();
    await Promise.all([loadAccounts(), loadPublications(), loadSummary()]);
  } catch (error) {
    alert(error.message);
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const result = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    state.token = result.token;
    state.user = result.user;
    localStorage.setItem('instagramSchedulerToken', result.token);
    renderAuth();
    await Promise.all([loadAccounts(), loadPublications(), loadSummary()]);
  } catch (error) {
    alert(error.message);
  }
}

async function addAccount() {
  const username = document.getElementById('accountUsername').value.trim();
  const accessToken = document.getElementById('accountToken').value.trim();

  try {
    await api('/accounts', {
      method: 'POST',
      body: JSON.stringify({ username, accessToken, refreshToken: 'fake_refresh_token' })
    });

    document.getElementById('accountUsername').value = '';
    document.getElementById('accountToken').value = '';
    await loadAccounts();
  } catch (error) {
    alert(error.message);
  }
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erreur lors du chargement du fichier'));
    reader.readAsDataURL(file);
  });
}

async function createPublication() {
  const accountId = document.getElementById('postAccountSelect').value;
  const mediaType = document.getElementById('mediaType').value;
  const mediaUrlInput = document.getElementById('mediaUrl').value.trim();
  const caption = document.getElementById('caption').value.trim();
  const scheduledAt = document.getElementById('scheduledAt').value;
  const fileInput = document.getElementById('mediaFile');
  const file = fileInput.files && fileInput.files[0];

  if (!accountId || !scheduledAt) {
    alert('Le compte et la date sont requis.');
    return;
  }

  try {
    let mediaUrl = mediaUrlInput;
    if (file) {
      mediaUrl = await readFileAsDataUrl(file);
    }

    await api('/publications', {
      method: 'POST',
      body: JSON.stringify({ accountId, mediaType, mediaUrl, caption, scheduledAt })
    });

    document.getElementById('mediaUrl').value = '';
    document.getElementById('caption').value = '';
    document.getElementById('scheduledAt').value = '';
    document.getElementById('mediaFile').value = '';

    await Promise.all([loadPublications(), loadSummary()]);
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('instagramSchedulerToken');
  renderAuth();
}

document.getElementById('registerBtn').addEventListener('click', registerUser);
document.getElementById('loginBtn').addEventListener('click', loginUser);
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('addAccountBtn').addEventListener('click', addAccount);
document.getElementById('createPostBtn').addEventListener('click', createPublication);
document.getElementById('refreshPostsBtn').addEventListener('click', async () => {
  await Promise.all([loadAccounts(), loadPublications(), loadSummary()]);
});

renderAuth();
if (state.token) {
  loadUser();
}
