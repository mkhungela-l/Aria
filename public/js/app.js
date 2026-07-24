/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Aria - AI-Powered Productivity Suite
 * Frontend Application (SPA)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This single-page application provides:
 *   - Full authentication flow (register/login/logout)
 *   - Dashboard with analytics, charts, activity feed
 *   - Notes CRUD with categories, tags, pinning, archiving, trash
 *   - Kanban-style task management with drag-and-drop simulation
 *   - Voice note recording simulation with AI transcription
 *   - Daily mood tracking with streak calculation
 *   - Pomodoro focus timer
 *   - AI-powered productivity insights
 *   - Calendar view
 *   - User settings (theme, preferences)
 *   - Global search
 *   - Dark/light theme toggle
 *   - Keyboard shortcuts
 *   - Responsive mobile-friendly layout
 * ───────────────────────────────────────────────────────────────────────────────
 * Architecture: All API calls use fetch() with JWT Bearer auth.
 * State is managed in-memory and re-fetched on navigation.
 * ───────────────────────────────────────────────────────────────────────────────
 */

// ═════════════════════════════════════════════════════════════════════════════
//  STATE & CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════

/** Application state object - holds all runtime data */
const state = {
  token: localStorage.getItem('aria_token') || null,
  user: null,
  currentView: 'dashboard',
  notes: [],
  tasks: [],
  kanbanData: { todo: [], 'in-progress': [], review: [], done: [] },
  recordings: [],
  moods: [],
  insights: [],
  settings: {},
  dashboardStats: null,
  selectedMood: 0,
  selectedEnergy: 3,
  focusMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  focusTimeLeft: 25 * 60,
  focusTotalTime: 25 * 60,
  focusRunning: false,
  focusInterval: null,
  calendarDate: new Date(),
  searchQuery: ''
};

// ─── API Base URL ──────────────────────────────────────────────────────────
const API = window.location.origin + '/api';

/**
 * Makes an authenticated API request.
 * Automatically attaches the JWT token and handles JSON parsing.
 * 
 * @param {string} endpoint - API endpoint path (e.g., '/notes')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  try {
    const response = await fetch(`${API}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`);
    }
    return data;
  } catch (err) {
    if (err.message.includes('401') || err.message.includes('token')) {
      // Token expired — redirect to login
      handleLogout();
    }
    throw err;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  TOAST NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Shows a toast notification.
 * Supports success, error, warning, and info types with auto-dismiss.
 * 
 * @param {string} message - Notification text
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - Auto-dismiss time in ms (0 = no dismiss)
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
  `;
  container.appendChild(toast);
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  MODAL SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Opens a modal dialog with dynamic content.
 * 
 * @param {string} html - HTML content to render inside the modal
 */
function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

/** Closes the currently open modal. */
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ═════════════════════════════════════════════════════════════════════════════
//  AUTHENTICATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handles user login form submission.
 * Authenticates with the backend and stores the JWT token.
 */
async function handleLogin(event) {
  event.preventDefault();
  const btn = document.getElementById('login-btn');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  btn.querySelector('.btn-text').classList.add('hidden');
  btn.querySelector('.btn-loader').classList.remove('hidden');
  btn.disabled = true;

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('aria_token', data.token);
    showToast(data.message || 'Welcome back!', 'success');
    initializeApp();
  } catch (err) {
    showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    btn.querySelector('.btn-text').classList.remove('hidden');
    btn.querySelector('.btn-loader').classList.add('hidden');
    btn.disabled = false;
  }
}

/**
 * Handles user registration form submission.
 * Creates a new account and auto-authenticates.
 */
async function handleRegister(event) {
  event.preventDefault();
  const btn = document.getElementById('register-btn');
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  btn.querySelector('.btn-text').classList.add('hidden');
  btn.querySelector('.btn-loader').classList.remove('hidden');
  btn.disabled = true;

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('aria_token', data.token);
    showToast(data.message || 'Account created! Welcome to Aria.', 'success');
    initializeApp();
  } catch (err) {
    showToast(err.message || 'Registration failed. Please try again.', 'error');
    btn.querySelector('.btn-text').classList.remove('hidden');
    btn.querySelector('.btn-loader').classList.add('hidden');
    btn.disabled = false;
  }
}

/**
 * Logs the user out: clears token, resets state, and shows auth screen.
 */
async function handleLogout() {
  try { await apiRequest('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
  state.token = null;
  state.user = null;
  localStorage.removeItem('aria_token');
  // Stop focus timer if running
  if (state.focusInterval) { clearInterval(state.focusInterval); state.focusRunning = false; }
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('loading-screen').classList.add('hidden');
  showToast('Signed out successfully', 'info');
}

/**
 * Toggles password visibility in auth forms.
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

/**
 * Shows the registration form, hides the login form.
 */
function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}

/**
 * Shows the login form, hides the registration form.
 */
function showLogin() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

// ═════════════════════════════════════════════════════════════════════════════
//  APP INITIALIZATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Initializes the main application after authentication.
 * Loads user profile, sets up the UI, and navigates to the dashboard.
 */
async function initializeApp() {
  try {
    // Fetch user profile if we have a token but no user data
    if (!state.user && state.token) {
      const data = await apiRequest('/auth/me');
      state.user = data.user;
    }
  } catch (e) {
    // If the token is invalid, clear it and show auth
    if (e.message.includes('401') || e.message.includes('Session')) {
      handleLogout();
      return;
    }
  }

  if (!state.user || !state.token) {
    document.getElementById('loading-screen').classList.add('hidden');
    return;
  }

  // ── Set up sidebar user info ──────────────────────────────────────────────
  document.getElementById('sidebar-avatar').textContent = (state.user.displayName || state.user.username || 'U')[0].toUpperCase();
  document.getElementById('sidebar-username').textContent = state.user.displayName || state.user.username;
  document.getElementById('sidebar-email').textContent = state.user.email;

  // ── Toggle screens ─────────────────────────────────────────────────────────
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');

  // ── Load initial data and navigate ─────────────────────────────────────────
  await Promise.all([
    loadNotesCount(),
    loadTasksCount()
  ]);
  navigateTo('dashboard');

  // ── Hide loading screen ────────────────────────────────────────────────────
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 500);
}

/**
 * Checks authentication on page load and initializes the app accordingly.
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (state.token) {
    try {
      const data = await apiRequest('/auth/me');
      state.user = data.user;
      initializeApp();
    } catch (e) {
      document.getElementById('loading-screen').classList.add('hidden');
    }
  } else {
    document.getElementById('loading-screen').classList.add('hidden');
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  NAVIGATION
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Navigates to a specific view/page within the SPA.
 * Updates the sidebar active state, page title, and renders the view.
 * 
 * @param {string} view - View identifier: 'dashboard', 'notes', 'tasks', etc.
 */
async function navigateTo(view) {
  state.currentView = view;

  // ── Update sidebar active state ────────────────────────────────────────────
  document.querySelectorAll('.nav-item[data-view]').forEach(el => {
    el.classList.toggle('active', el.dataset.view === view);
  });

  // ── Update page title ──────────────────────────────────────────────────────
  const titles = {
    dashboard: 'Dashboard', notes: 'Notes', tasks: 'Tasks', voice: 'Voice Notes',
    mood: 'Mood Tracker', focus: 'Focus Timer', insights: 'Smart Insights',
    calendar: 'Calendar', settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[view] || 'Dashboard';

  // ── Render the view ────────────────────────────────────────────────────────
  const content = document.getElementById('page-content');
  content.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin fa-2x" style="display:block;margin:4rem auto;text-align:center;color:var(--text-muted)"></i></div>';

  try {
    switch (view) {
      case 'dashboard': await renderDashboard(); break;
      case 'notes': await renderNotes(); break;
      case 'tasks': await renderTasks(); break;
      case 'voice': await renderVoice(); break;
      case 'mood': await renderMood(); break;
      case 'focus': renderFocus(); break;
      case 'insights': await renderInsights(); break;
      case 'calendar': renderCalendar(); break;
      case 'settings': await renderSettings(); break;
      default: renderDashboard();
    }
  } catch (err) {
    content.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Something went wrong</h3><p>${err.message}</p></div>`;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  SIDEBAR
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Toggles the sidebar open/closed on mobile and collapsed states.
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
  sidebar.classList.toggle('collapsed');
}

// ═════════════════════════════════════════════════════════════════════════════
//  THEME / DARK MODE
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Toggles between light and dark themes.
 * Persists the preference in localStorage and updates the API.
 */
function toggleDarkMode() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-icon').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('aria_theme', next);
  // Update settings on server
  if (state.token) {
    apiRequest('/settings/theme', { method: 'PUT', body: JSON.stringify({ theme: next }) })
      .catch(() => {});
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  GLOBAL SEARCH
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handles global search input — searches notes and tasks by title/content.
 * 
 * @param {string} query - The search query string
 */
function handleGlobalSearch(query) {
  state.searchQuery = query.trim().toLowerCase();
  // Re-render the current view with search results
  if (state.currentView === 'notes') renderNotes();
  else if (state.currentView === 'tasks') renderTasks();
}

function expandSearch() {
  // Handled via CSS :focus-within
}

function collapseSearch() {
  if (!document.querySelector('.search-bar input').value) {
    // Handled via CSS
  }
}

/**
 * Loads the notes count badge in the sidebar.
 */
async function loadNotesCount() {
  try {
    const data = await apiRequest('/notes');
    document.getElementById('notes-count-badge').textContent = data.count || 0;
  } catch (e) { /* ignore */ }
}

/**
 * Loads the tasks count badge in the sidebar.
 */
async function loadTasksCount() {
  try {
    const data = await apiRequest('/tasks?status=todo');
    document.getElementById('tasks-count-badge').textContent = data.count || 0;
  } catch (e) { /* ignore */ }
}

// ═════════════════════════════════════════════════════════════════════════════
//  DASHBOARD VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the dashboard with statistics, activity chart, and recent activity.
 */
async function renderDashboard() {
  try {
    const [statsRes, insightsRes, moodRes] = await Promise.all([
      apiRequest('/dashboard/stats'),
      apiRequest('/dashboard/insights'),
      apiRequest('/mood?days=7')
    ]);

    state.dashboardStats = statsRes;
    state.insights = insightsRes.insights || [];
    state.moods = moodRes.history || [];

    const stats = statsRes.overview || {};
    const activity = statsRes.recentActivity || [];
    const weekly = statsRes.weeklyActivity || [];

    // ── Determine max values for chart scaling ───────────────────────────────
    const maxNotes = Math.max(...weekly.map(d => d.notesCreated), 1);
    const maxTasks = Math.max(...weekly.map(d => d.tasksCompleted), 1);

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <!-- Welcome -->
        <div style="margin-bottom:1.5rem">
          <h2 style="font-size:1.5rem;font-weight:700">Welcome back, ${state.user.displayName || state.user.username}! 👋</h2>
          <p style="color:var(--text-secondary)">Here's your productivity overview for today.</p>
        </div>

        <!-- Stats Cards Grid -->
        <div class="dashboard-grid">
          <div class="stat-card primary" onclick="navigateTo('notes')">
            <div class="stat-icon"><i class="fas fa-sticky-note"></i></div>
            <div class="stat-info">
              <div class="stat-value">${stats.activeNotes || 0}</div>
              <div class="stat-label">Active Notes</div>
              <div class="stat-change up">${stats.archivedNotes || 0} archived</div>
            </div>
          </div>
          <div class="stat-card success" onclick="navigateTo('tasks')">
            <div class="stat-icon"><i class="fas fa-tasks"></i></div>
            <div class="stat-info">
              <div class="stat-value">${stats.completionRate || 0}%</div>
              <div class="stat-label">Task Completion</div>
              <div class="stat-change up">${stats.doneTasks || 0}/${stats.totalTasks || 0} done</div>
            </div>
          </div>
          <div class="stat-card warning" onclick="navigateTo('tasks')">
            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-info">
              <div class="stat-value">${stats.overdueTasks || 0}</div>
              <div class="stat-label">Overdue Tasks</div>
              <div class="stat-change ${(stats.overdueTasks || 0) > 0 ? 'down' : 'up'}">${(stats.overdueTasks || 0) > 0 ? 'Needs attention' : 'All caught up!'}</div>
            </div>
          </div>
          <div class="stat-card accent" onclick="navigateTo('voice')">
            <div class="stat-icon"><i class="fas fa-microphone"></i></div>
            <div class="stat-info">
              <div class="stat-value">${stats.voiceNotesCount || 0}</div>
              <div class="stat-label">Voice Recordings</div>
              <div class="stat-change up">${stats.totalFocusMinutes || 0} min focused</div>
            </div>
          </div>
          <div class="stat-card info" onclick="navigateTo('mood')">
            <div class="stat-icon"><i class="fas fa-smile"></i></div>
            <div class="stat-info">
              <div class="stat-value">${stats.currentStreak || 0} days</div>
              <div class="stat-label">Active Streak</div>
              <div class="stat-change up">Best: ${stats.longestStreak || 0} days</div>
            </div>
          </div>
          <div class="stat-card" style="border-color:var(--primary)" onclick="navigateTo('focus')">
            <div class="stat-icon" style="background:var(--primary-bg);color:var(--primary)"><i class="fas fa-clock"></i></div>
            <div class="stat-info">
              <div class="stat-value">${Math.round((stats.totalFocusMinutes || 0) / 60)}h</div>
              <div class="stat-label">Total Focus Time</div>
              <div class="stat-change up">${stats.totalFocusMinutes || 0} minutes</div>
            </div>
          </div>
        </div>

        <!-- Weekly Activity Chart -->
        <div class="chart-container">
          <h4>📊 Weekly Activity</h4>
          <div class="chart-bars">
            ${weekly.map((day, i) => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const d = new Date(day.date);
              const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : dayNames[d.getDay()];
              return `
                <div class="chart-bar-group">
                  <div class="chart-bar-wrapper">
                    <div class="chart-bar notes" style="height:${(day.notesCreated / maxNotes) * 150 + 4}px" title="${day.notesCreated} notes"></div>
                    <div class="chart-bar tasks" style="height:${(day.tasksCompleted / maxTasks) * 150 + 4}px" title="${day.tasksCompleted} tasks"></div>
                  </div>
                  <div class="chart-label">${label}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Recent Activity & Quick Insights -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
          <div>
            <div class="section-header">
              <h3>🕐 Recent Activity</h3>
            </div>
            <div class="activity-list">
              ${activity.length > 0 ? activity.slice(0, 6).map(item => `
                <div class="activity-item" onclick="navigateTo('${item.type === 'voice' ? 'voice' : item.type === 'task' ? 'tasks' : 'notes'}')">
                  <div class="activity-icon ${item.type}">
                    <i class="fas ${item.type === 'note' ? 'fa-sticky-note' : item.type === 'task' ? 'fa-check' : 'fa-microphone'}"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">${escapeHtml(item.title)}</div>
                    <div class="activity-date">${timeAgo(item.date)}</div>
                  </div>
                  <div class="activity-type">${item.type}</div>
                </div>
              `).join('') : `
                <div class="empty-state" style="padding:2rem">
                  <p>No recent activity. Start by creating a note or task!</p>
                </div>
              `}
            </div>
          </div>
          <div>
            <div class="section-header">
              <h3>💡 Smart Insights</h3>
              <button class="btn btn-sm btn-ghost" onclick="navigateTo('insights')">View all</button>
            </div>
            <div class="insights-grid" style="grid-template-columns:1fr">
              ${(state.insights || []).slice(0, 3).map(insight => `
                <div class="insight-card ${insight.type}">
                  <div class="insight-card-header">
                    <div class="insight-card-icon">${insight.icon}</div>
                    <div>
                      <div class="insight-card-title">${insight.title}</div>
                    </div>
                  </div>
                  <div class="insight-card-desc">${insight.description}</div>
                  ${insight.action ? `<div class="insight-card-action"><button class="btn btn-sm ${insight.type === 'warning' ? 'btn-danger' : 'btn-primary'}" onclick="showToast('${escapeHtml(insight.action)}', 'info')">${insight.action}</button></div>` : ''}
                </div>
              `).join('')}
              ${(!state.insights || state.insights.length === 0) ? '<div class="empty-state" style="padding:2rem"><p>Create notes and tasks to get AI-powered insights!</p></div>' : ''}
            </div>
          </div>
        </div>

        <!-- Priority Breakdown -->
        ${statsRes.priorityBreakdown ? `
        <div class="section-header" style="margin-top:2rem">
          <h3>🎯 Priority Breakdown</h3>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem">
          ${Object.entries(statsRes.priorityBreakdown).map(([key, val]) => `
            <div class="stat-card" style="cursor:default" onclick="navigateTo('tasks')">
              <div class="stat-info">
                <div class="stat-value" style="color:var(--priority-${key})">${val}</div>
                <div class="stat-label" style="text-transform:capitalize">${key}</div>
              </div>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    `;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `
      <div class="empty-state">
        <i class="fas fa-chart-line"></i>
        <h3>Dashboard</h3>
        <p>${err.message}. Start creating notes and tasks to see your stats!</p>
      </div>
    `;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  NOTES VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Notes view with CRUD capability, categories, tags, and search.
 */
async function renderNotes() {
  try {
    const search = state.searchQuery ? `&search=${encodeURIComponent(state.searchQuery)}` : '';
    const data = await apiRequest(`/notes${search}`);
    state.notes = data.notes || [];

    // Fetch categories and tags
    let cats = {}, tags = {};
    try {
      const catData = await apiRequest('/notes/categories/all');
      cats = catData.categories || {};
      tags = catData.tags || {};
    } catch (e) { /* ignore */ }

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <!-- Toolbar -->
        <div class="notes-toolbar">
          <div class="search-bar" style="flex:1">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search notes..." value="${escapeHtml(state.searchQuery)}" oninput="state.searchQuery=this.value;renderNotes()">
          </div>
          <button class="btn btn-primary" onclick="showCreateNote()">
            <i class="fas fa-plus"></i> New Note
          </button>
          <button class="btn btn-sm btn-ghost" onclick="navigateTo('notes')">
            <i class="fas fa-th-large"></i> All
          </button>
          <button class="btn btn-sm btn-ghost" onclick="showTrashedNotes()">
            <i class="fas fa-trash"></i> Trash
          </button>
        </div>

        <!-- Categories Pills -->
        ${Object.keys(cats).length > 0 ? `
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem">
          ${Object.entries(cats).map(([cat, count]) => `
            <button class="btn btn-sm btn-ghost" onclick="filterByCategory('${escapeHtml(cat)}')">
              ${escapeHtml(cat)} <span style="color:var(--text-muted);font-size:0.75rem">(${count})</span>
            </button>
          `).join('')}
        </div>` : ''}

        <!-- Notes Grid -->
        <div class="notes-grid">
          ${state.notes.length > 0 ? state.notes.map(note => `
            <div class="note-card ${note.isPinned ? 'pinned' : ''}" onclick="showEditNote('${note.id}')" style="${note.color && note.color !== '#ffffff' ? `border-color:${note.color};box-shadow:0 0 0 1px ${note.color}20` : ''}">
              <div class="note-card-header">
                <div class="note-card-title">${escapeHtml(note.title || 'Untitled')}</div>
                ${note.isPinned ? '<div class="note-card-pin"><i class="fas fa-thumbtack"></i></div>' : ''}
              </div>
              <div class="note-card-preview">${escapeHtml(note.content || 'No content')}</div>
              ${note.tags && note.tags.length > 0 ? `
                <div class="note-card-tags">
                  ${note.tags.map(t => `<span class="note-tag"><i class="fas fa-tag"></i>${escapeHtml(t)}</span>`).join('')}
                </div>
              ` : ''}
              <div class="note-card-footer">
                <span>${note.category ? `<i class="fas fa-folder"></i> ${escapeHtml(note.category)}` : ''}</span>
                <span>${timeAgo(note.updatedAt)}</span>
              </div>
              <div class="note-card-actions">
                <button onclick="event.stopPropagation(); togglePinNote('${note.id}', ${!note.isPinned})" title="${note.isPinned ? 'Unpin' : 'Pin'}">
                  <i class="fas fa-thumbtack"></i>
                </button>
                <button onclick="event.stopPropagation(); archiveNote('${note.id}')" title="Archive">
                  <i class="fas fa-archive"></i>
                </button>
                <button onclick="event.stopPropagation(); deleteNote('${note.id}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-state" style="grid-column:1/-1">
              <i class="fas fa-sticky-note"></i>
              <h3>No notes yet</h3>
              <p>Create your first note to get started!</p>
              <button class="btn btn-primary mt-4" onclick="showCreateNote()">
                <i class="fas fa-plus"></i> Create Note
              </button>
            </div>
          `}
        </div>
      </div>
    `;
    document.getElementById('notes-count-badge').textContent = state.notes.length;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Failed to load notes</h3><p>${err.message}</p></div>`;
  }
}

/**
 * Shows a modal to create a new note.
 */
function showCreateNote(category) {
  openModal(`
    <div class="quick-form">
      <h3><i class="fas fa-sticky-note" style="color:var(--primary)"></i> Create Note</h3>
      <div class="form-group">
        <label>Title</label>
        <input type="text" id="note-title" placeholder="Note title..." autofocus>
      </div>
      <div class="form-group">
        <label>Content</label>
        <textarea id="note-content" placeholder="Write your note here..." rows="5"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="note-category" placeholder="general" value="${category || ''}">
        </div>
        <div class="form-group">
          <label>Tags (comma separated)</label>
          <input type="text" id="note-tags" placeholder="work, ideas">
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
        <label>Color:</label>
        <input type="color" id="note-color" value="#6366f1" style="width:40px;height:40px;border-radius:8px;border:2px solid var(--border);padding:2px;cursor:pointer">
        <label style="margin-left:0.5rem"><input type="checkbox" id="note-pinned"> Pin note</label>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="createNote()">
          <i class="fas fa-check"></i> Create
        </button>
      </div>
    </div>
  `);
}

/**
 * Creates a new note via the API and refreshes the view.
 */
async function createNote() {
  const title = document.getElementById('note-title').value.trim() || 'Untitled Note';
  const content = document.getElementById('note-content').value;
  const category = document.getElementById('note-category').value.trim() || 'general';
  const tags = document.getElementById('note-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const color = document.getElementById('note-color').value;
  const isPinned = document.getElementById('note-pinned').checked;

  try {
    await apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify({ title, content, category, tags, color, isPinned })
    });
    closeModal();
    showToast('Note created!', 'success');
    renderNotes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Shows a modal to edit an existing note.
 */
async function showEditNote(noteId) {
  try {
    const data = await apiRequest(`/notes/${noteId}`);
    const note = data.note;
    openModal(`
      <div class="quick-form">
        <h3><i class="fas fa-edit" style="color:var(--primary)"></i> Edit Note</h3>
        <div class="form-group">
          <label>Title</label>
          <input type="text" id="note-edit-title" value="${escapeHtml(note.title)}">
        </div>
        <div class="form-group">
          <label>Content</label>
          <textarea id="note-edit-content" rows="6">${escapeHtml(note.content || '')}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
          <div class="form-group">
            <label>Category</label>
            <input type="text" id="note-edit-category" value="${escapeHtml(note.category || '')}">
          </div>
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input type="text" id="note-edit-tags" value="${(note.tags || []).join(', ')}">
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
          <label><input type="checkbox" id="note-edit-pinned" ${note.isPinned ? 'checked' : ''}> Pinned</label>
          <label><input type="checkbox" id="note-edit-archived" ${note.isArchived ? 'checked' : ''}> Archived</label>
        </div>
        <div class="form-actions" style="justify-content:space-between">
          <button class="btn btn-danger btn-sm" onclick="deleteNote('${noteId}')">
            <i class="fas fa-trash"></i> Delete
          </button>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="updateNote('${noteId}')">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>
    `);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Updates a note via the API.
 */
async function updateNote(noteId) {
  const title = document.getElementById('note-edit-title').value.trim();
  const content = document.getElementById('note-edit-content').value;
  const category = document.getElementById('note-edit-category').value.trim() || 'general';
  const tags = document.getElementById('note-edit-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const isPinned = document.getElementById('note-edit-pinned').checked;
  const isArchived = document.getElementById('note-edit-archived').checked;

  try {
    await apiRequest(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content, category, tags, isPinned, isArchived })
    });
    closeModal();
    showToast('Note updated!', 'success');
    renderNotes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Toggles a note's pinned state.
 */
async function togglePinNote(noteId, pin) {
  try {
    await apiRequest(`/notes/${noteId}`, { method: 'PUT', body: JSON.stringify({ isPinned: pin }) });
    showToast(pin ? 'Note pinned' : 'Note unpinned', 'info');
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Archives a note.
 */
async function archiveNote(noteId) {
  try {
    await apiRequest(`/notes/${noteId}`, { method: 'PUT', body: JSON.stringify({ isArchived: true }) });
    showToast('Note archived', 'info');
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Soft-deletes a note (moves to trash).
 */
async function deleteNote(noteId) {
  if (!confirm('Move this note to trash?')) return;
  try {
    await apiRequest(`/notes/${noteId}`, { method: 'DELETE' });
    closeModal();
    showToast('Note moved to trash', 'warning');
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Shows trashed notes with restore/delete options.
 */
async function showTrashedNotes() {
  try {
    const data = await apiRequest('/notes?trashed=true');
    const trashed = data.notes || [];
    openModal(`
      <div class="quick-form">
        <h3><i class="fas fa-trash" style="color:var(--error)"></i> Trash (${trashed.length} items)</h3>
        ${trashed.length > 0 ? trashed.map(n => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;border-bottom:1px solid var(--border-light)">
            <div>
              <div style="font-weight:600;font-size:0.9rem">${escapeHtml(n.title)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted)">Deleted ${timeAgo(n.trashedAt)}</div>
            </div>
            <div style="display:flex;gap:0.375rem">
              <button class="btn btn-xs btn-secondary" onclick="restoreNote('${n.id}')">Restore</button>
              <button class="btn btn-xs btn-danger" onclick="permanentDelete('${n.id}')">Delete</button>
            </div>
          </div>
        `).join('') : '<div class="empty-state" style="padding:2rem"><p>Trash is empty</p></div>'}
        <div class="form-actions" style="margin-top:1rem">
          <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        </div>
      </div>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Restores a note from trash.
 */
async function restoreNote(noteId) {
  try {
    await apiRequest(`/notes/${noteId}/restore`, { method: 'PUT' });
    showToast('Note restored!', 'success');
    showTrashedNotes();
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Permanently deletes a note.
 */
async function permanentDelete(noteId) {
  if (!confirm('Permanently delete this note? This cannot be undone.')) return;
  try {
    await apiRequest(`/notes/${noteId}/permanent`, { method: 'DELETE' });
    showToast('Note permanently deleted', 'error');
    showTrashedNotes();
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Filters notes by category and navigates to notes view.
 */
async function filterByCategory(category) {
  state.searchQuery = '';
  try {
    const data = await apiRequest(`/notes?category=${encodeURIComponent(category)}`);
    state.notes = data.notes || [];
    renderNotes();
  } catch (err) { showToast(err.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════════════════════
//  TASKS VIEW (Kanban Board)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Kanban-style task board with drag-and-drop columns.
 */
async function renderTasks() {
  try {
    const search = state.searchQuery ? `&search=${encodeURIComponent(state.searchQuery)}` : '';
    const data = await apiRequest(`/tasks/kanban${search}`);
    state.kanbanData = data;

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <!-- Toolbar -->
        <div class="tasks-toolbar">
          <div class="search-bar" style="flex:1">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search tasks..." value="${escapeHtml(state.searchQuery)}" oninput="state.searchQuery=this.value;renderTasks()">
          </div>
          <button class="btn btn-primary" onclick="showCreateTask()">
            <i class="fas fa-plus"></i> New Task
          </button>
        </div>

        <!-- Kanban Board -->
        <div class="kanban-board">
          ${['todo', 'in-progress', 'review', 'done'].map(status => {
            const labels = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'done': 'Done' };
            const tasks = data[status] || [];
            return `
              <div class="kanban-column" ondragover="event.preventDefault()" ondrop="handleDrop(event, '${status}')">
                <div class="kanban-column-header">
                  <div class="kanban-column-title">
                    <span class="kanban-column-dot ${status}"></span>
                    ${labels[status]}
                  </div>
                  <span class="kanban-column-count">${tasks.length}</span>
                </div>
                <div class="kanban-cards" id="kanban-${status}">
                  ${tasks.length > 0 ? tasks.map(task => `
                    <div class="kanban-card" draggable="true"
                         ondragstart="handleDragStart(event, '${task.id}')"
                         onclick="showEditTask('${task.id}')">
                      <div class="kanban-card-priority ${task.priority}"></div>
                      <div class="kanban-card-title">${escapeHtml(task.title)}</div>
                      <div class="kanban-card-meta">
                        <span class="kanban-card-priority-label ${task.priority}">${task.priority}</span>
                        ${task.dueDate ? `<span><i class="far fa-calendar"></i> ${formatDate(task.dueDate)}</span>` : ''}
                        ${task.category ? `<span><i class="fas fa-folder"></i> ${escapeHtml(task.category)}</span>` : ''}
                      </div>
                    </div>
                  `).join('') : `
                    <div style="text-align:center;padding:2rem 1rem;color:var(--text-muted);font-size:0.85rem">
                      <i class="fas fa-plus-circle" style="font-size:1.5rem;display:block;margin-bottom:0.5rem;opacity:0.5"></i>
                      Drop tasks here
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    // Update badge counts
    const todoCount = (data.todo || []).length;
    document.getElementById('tasks-count-badge').textContent = todoCount;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Failed to load tasks</h3><p>${err.message}</p></div>`;
  }
}

// ─── Kanban Drag & Drop ────────────────────────────────────────────────────
let draggedTaskId = null;

function handleDragStart(event, taskId) {
  draggedTaskId = taskId;
  event.dataTransfer.effectAllowed = 'move';
}

async function handleDrop(event, newStatus) {
  event.preventDefault();
  if (!draggedTaskId) return;
  const taskId = draggedTaskId;
  draggedTaskId = null;
  try {
    await apiRequest(`/tasks/${taskId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, order: 0 })
    });
    showToast(`Task moved to ${newStatus}`, 'success');
    renderTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

/**
 * Shows a modal to create a new task.
 */
function showCreateTask() {
  openModal(`
    <div class="quick-form">
      <h3><i class="fas fa-tasks" style="color:var(--success)"></i> Create Task</h3>
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="task-title" placeholder="What needs to be done?" autofocus>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="task-desc" placeholder="Optional details..." rows="3"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
        <div class="form-group">
          <label>Priority</label>
          <select id="task-priority">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" id="task-category" placeholder="general">
        </div>
      </div>
      <div class="form-group">
        <label>Due Date</label>
        <input type="date" id="task-due">
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="createTask()">
          <i class="fas fa-check"></i> Create
        </button>
      </div>
    </div>
  `);
}

/**
 * Creates a new task via the API.
 */
async function createTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) { showToast('Task title is required', 'error'); return; }
  try {
    await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description: document.getElementById('task-desc').value,
        priority: document.getElementById('task-priority').value,
        category: document.getElementById('task-category').value.trim() || 'general',
        dueDate: document.getElementById('task-due').value || null
      })
    });
    closeModal();
    showToast('Task created!', 'success');
    renderTasks();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Shows a modal to edit an existing task with status update options.
 */
async function showEditTask(taskId) {
  try {
    const data = await apiRequest(`/tasks/${taskId}`);
    const task = data.task;
    openModal(`
      <div class="quick-form">
        <h3><i class="fas fa-edit" style="color:var(--success)"></i> Edit Task</h3>
        <div class="form-group">
          <label>Title</label>
          <input type="text" id="task-edit-title" value="${escapeHtml(task.title)}">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="task-edit-desc" rows="3">${escapeHtml(task.description || '')}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem">
          <div class="form-group">
            <label>Status</label>
            <select id="task-edit-status">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="review" ${task.status === 'review' ? 'selected' : ''}>Review</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select id="task-edit-priority">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Due Date</label>
          <input type="date" id="task-edit-due" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}">
        </div>
        <div class="form-actions" style="justify-content:space-between">
          <button class="btn btn-danger btn-sm" onclick="deleteTask('${taskId}')">
            <i class="fas fa-trash"></i> Delete
          </button>
          <div style="display:flex;gap:0.5rem">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="updateTask('${taskId}')">
              <i class="fas fa-save"></i> Save
            </button>
          </div>
        </div>
      </div>
    `);
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Updates a task via the API.
 */
async function updateTask(taskId) {
  try {
    await apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: document.getElementById('task-edit-title').value.trim(),
        description: document.getElementById('task-edit-desc').value,
        status: document.getElementById('task-edit-status').value,
        priority: document.getElementById('task-edit-priority').value,
        dueDate: document.getElementById('task-edit-due').value || null
      })
    });
    closeModal();
    showToast('Task updated!', 'success');
    renderTasks();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Deletes a task.
 */
async function deleteTask(taskId) {
  if (!confirm('Delete this task permanently?')) return;
  try {
    await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
    closeModal();
    showToast('Task deleted', 'error');
    renderTasks();
  } catch (err) { showToast(err.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════════════════════
//  VOICE NOTES VIEW
// ═════════════════════════════════════════════════════════════════════════════

let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;

/**
 * Renders the Voice Notes view with recording capability and history.
 */
async function renderVoice() {
  try {
    const data = await apiRequest('/voice');
    state.recordings = data.recordings || [];

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <!-- Voice Recorder -->
        <div class="voice-recorder">
          <h3 style="margin-bottom:1rem;font-weight:600">🎙️ Voice Recorder</h3>
          <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem">
            Click to record a voice note. Aria will auto-transcribe it.
          </p>
          <button class="voice-recorder-btn" id="record-btn" onclick="toggleRecording()">
            <i class="fas fa-microphone"></i>
          </button>
          <div class="voice-recorder-status" id="recorder-status">Ready to record</div>
          <div class="voice-recorder-timer" id="recorder-timer">00:00</div>
          <div style="margin-top:1rem">
            <input type="text" id="voice-title" placeholder="Recording title..." style="width:100%;max-width:400px;padding:0.5rem 1rem;border:2px solid var(--border);border-radius:10px;background:var(--bg-input);color:var(--text);font-family:inherit;outline:none">
          </div>
        </div>

        <!-- Recording History -->
        <div class="section-header">
          <h3>📂 Recording History</h3>
          <span style="color:var(--text-muted);font-size:0.85rem">${state.recordings.length} recordings</span>
        </div>
        <div class="voice-list">
          ${state.recordings.length > 0 ? state.recordings.map(rec => `
            <div class="voice-item" onclick="showTranscription('${rec.id}')">
              <div class="voice-item-icon"><i class="fas fa-headphones"></i></div>
              <div class="voice-item-info">
                <div class="voice-item-title">${escapeHtml(rec.title)}</div>
                <div class="voice-item-meta">
                  ${formatDuration(rec.duration)} • ${timeAgo(rec.createdAt)}
                </div>
                <div class="voice-item-transcription">${escapeHtml(rec.transcription || 'No transcription')}</div>
              </div>
              <div class="voice-item-actions">
                <button onclick="event.stopPropagation(); playRecording('${rec.id}')" title="Play">
                  <i class="fas fa-play"></i>
                </button>
                <button onclick="event.stopPropagation(); deleteRecording('${rec.id}')" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('') : `
            <div class="empty-state">
              <i class="fas fa-microphone"></i>
              <h3>No recordings yet</h3>
              <p>Press the record button above to create your first voice note!</p>
            </div>
          `}
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-microphone"></i><h3>Voice Notes</h3><p>${err.message}</p></div>`;
  }
}

/**
 * Toggles voice recording on/off with simulated recording and transcription.
 */
function toggleRecording() {
  const btn = document.getElementById('record-btn');
  const status = document.getElementById('recorder-status');
  const timer = document.getElementById('recorder-timer');

  if (btn.classList.contains('recording')) {
    // ── Stop Recording ──────────────────────────────────────────────────────
    btn.classList.remove('recording');
    btn.innerHTML = '<i class="fas fa-microphone"></i>';
    clearInterval(recordingTimer);
    status.textContent = 'Processing...';
    status.style.color = 'var(--primary)';

    // Simulate upload and transcription
    const title = document.getElementById('voice-title').value.trim() || `Voice Note ${new Date().toLocaleString()}`;
    const duration = recordingSeconds;
    recordingSeconds = 0;

    setTimeout(async () => {
      try {
        const sampleTexts = [
          "Meeting notes: Discussed Q2 goals and project milestones. Action items include updating the roadmap and scheduling follow-up meetings.",
          "Quick idea: What if we implemented a dark mode with custom accent colors? Users could personalize their workspace.",
          "Reminder: Call the design team about the new mockups. Need feedback by Friday.",
          "Journal entry: Today was productive. Completed the API refactoring and wrote documentation.",
          "Brainstorming: New feature ideas for the productivity suite. Voice notes, smart tags, AI suggestions."
        ];
        const transcription = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

        // Simulate upload via the API
        const formData = new FormData();
        const blob = new Blob(['Simulated audio content'], { type: 'audio/webm' });
        formData.append('audio', blob, `${title.replace(/\s+/g, '_')}.webm`);
        formData.append('title', title);
        formData.append('duration', duration);
        formData.append('tags', JSON.stringify([]));

        const response = await fetch(`${API}/voice/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${state.token}` },
          body: formData
        });
        const result = await response.json();

        status.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success)"></i> Transcribed & saved!`;
        timer.textContent = formatDuration(duration);
        showToast('Voice note recorded and transcribed!', 'success');
        renderVoice();
      } catch (err) {
        status.textContent = 'Upload failed. Try again.';
        status.style.color = 'var(--error)';
        showToast(err.message, 'error');
      }
    }, 1500);
  } else {
    // ── Start Recording ─────────────────────────────────────────────────────
    btn.classList.add('recording');
    btn.innerHTML = '<i class="fas fa-stop"></i>';
    status.textContent = '🔴 Recording... Speak now!';
    status.style.color = 'var(--error)';
    recordingSeconds = 0;
    timer.textContent = '00:00';

    // Simulate recording timer
    recordingTimer = setInterval(() => {
      recordingSeconds++;
      timer.textContent = formatDuration(recordingSeconds);
    }, 1000);
  }
}

/**
 * Shows recording transcription detail in a modal.
 */
function showTranscription(id) {
  const rec = state.recordings.find(r => r.id === id);
  if (!rec) return;
  openModal(`
    <div class="quick-form">
      <h3><i class="fas fa-headphones" style="color:var(--accent)"></i> ${escapeHtml(rec.title)}</h3>
      <div style="margin:1rem 0;padding:1rem;background:var(--bg-input);border-radius:12px">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem">📝 Transcription</div>
        <p style="line-height:1.7">${escapeHtml(rec.transcription || 'No transcription available')}</p>
      </div>
      <div style="display:flex;gap:1rem;font-size:0.85rem;color:var(--text-secondary)">
        <span>⏱ ${formatDuration(rec.duration)}</span>
        <span>📅 ${new Date(rec.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="form-actions" style="margin-top:1rem">
        <input type="text" id="transcription-edit" value="${escapeHtml(rec.transcription || '')}" style="flex:1;padding:0.5rem 1rem;border:2px solid var(--border);border-radius:10px;background:var(--bg-input);color:var(--text);font-family:inherit">
        <button class="btn btn-primary" onclick="updateTranscription('${rec.id}')">Update</button>
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
}

/**
 * Updates a recording's transcription.
 */
async function updateTranscription(id) {
  const transcription = document.getElementById('transcription-edit').value;
  try {
    await apiRequest(`/voice/${id}`, { method: 'PUT', body: JSON.stringify({ transcription }) });
    closeModal();
    showToast('Transcription updated', 'success');
    renderVoice();
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Simulates playing a recording.
 */
function playRecording(id) {
  showToast('🎵 Playing recording... (simulated)', 'info');
}

/**
 * Deletes a voice recording.
 */
async function deleteRecording(id) {
  if (!confirm('Delete this recording?')) return;
  try {
    await apiRequest(`/voice/${id}`, { method: 'DELETE' });
    showToast('Recording deleted', 'error');
    renderVoice();
  } catch (err) { showToast(err.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════════════════════
//  MOOD TRACKER VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Mood Tracker with mood input, history, and streak.
 */
async function renderMood() {
  try {
    const data = await apiRequest('/mood?days=30');
    state.moods = data.history || [];
    const streak = data.streak || 0;

    // Check if already logged today
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = state.moods.find(m => m.date === today);
    const loggedToday = !!todayEntry;

    const moodEmojis = ['😢', '😟', '😐', '😊', '😄'];

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <div class="mood-container">
          <!-- Mood Input -->
          <div class="mood-input-card">
            <h3>${loggedToday ? '✏️ Update Today\'s Mood' : '🌤️ How are you feeling today?'}</h3>
            ${loggedToday ? `<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem">You already logged today: ${moodEmojis[todayEntry.mood - 1] || '😐'} (${todayEntry.mood}/5)</p>` : ''}
            <div class="mood-selector" id="mood-selector">
              ${moodEmojis.map((emoji, i) => `
                <button class="mood-btn ${(loggedToday && todayEntry.mood === i + 1) ? 'selected' : ''}"
                        onclick="selectMood(${i + 1})" title="${i + 1}/5">
                  ${emoji}
                </button>
              `).join('')}
            </div>
            <div style="margin-bottom:0.5rem;color:var(--text-muted);font-size:0.85rem">Energy Level</div>
            <div class="energy-selector" id="energy-selector">
              ${[1,2,3,4,5].map(i => `
                <div class="energy-bar ${(loggedToday && todayEntry.energyLevel === i) ? 'active' : ''}"
                     onclick="selectEnergy(${i})"></div>
              `).join('')}
            </div>
            <div class="form-group" style="max-width:400px;margin:1rem auto 0">
              <textarea id="mood-note" placeholder="Add a note about your day..." rows="2" style="width:100%;padding:0.75rem;border:2px solid var(--border);border-radius:12px;background:var(--bg-input);color:var(--text);font-family:inherit;resize:vertical">${todayEntry ? escapeHtml(todayEntry.note || '') : ''}</textarea>
            </div>
            <button class="btn btn-primary mt-4" onclick="logMood()">
              <i class="fas fa-check"></i> ${loggedToday ? 'Update Mood' : 'Log Mood'}
            </button>
          </div>

          <!-- Stats -->
          <div class="dashboard-grid" style="margin-bottom:1.5rem">
            <div class="stat-card success">
              <div class="stat-info">
                <div class="stat-value">${data.averageMood || 0}</div>
                <div class="stat-label">Average Mood</div>
              </div>
            </div>
            <div class="stat-card info">
              <div class="stat-info">
                <div class="stat-value">${data.averageEnergy || 0}</div>
                <div class="stat-label">Avg Energy</div>
              </div>
            </div>
            <div class="stat-card primary">
              <div class="stat-info">
                <div class="stat-value">${streak} days</div>
                <div class="stat-label">Mood Streak</div>
              </div>
            </div>
            <div class="stat-card accent">
              <div class="stat-info">
                <div class="stat-value">${data.totalEntries || 0}</div>
                <div class="stat-label">Total Entries</div>
              </div>
            </div>
          </div>

          <!-- History -->
          <div class="section-header">
            <h3>📋 Recent Entries</h3>
          </div>
          <div class="mood-history">
            ${state.moods.length > 0 ? state.moods.slice(0, 10).map(m => `
              <div class="mood-entry">
                <span class="mood-entry-date">${new Date(m.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span class="mood-entry-emoji">${moodEmojis[m.mood - 1] || '😐'}</span>
                <span style="flex:1;font-size:0.85rem;color:var(--text-secondary)">${escapeHtml(m.note || '')}</span>
                <span style="font-size:0.7rem;color:var(--text-muted)">Energy: ${'⚡'.repeat(m.energyLevel || 3)}</span>
              </div>
            `).join('') : '<div class="empty-state" style="padding:2rem"><p>No mood entries yet. Log your first one above!</p></div>'}
          </div>
        </div>
      </div>
    `;

    state.selectedMood = loggedToday ? todayEntry.mood : 0;
    state.selectedEnergy = loggedToday ? todayEntry.energyLevel : 3;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-smile"></i><h3>Mood Tracker</h3><p>${err.message}</p></div>`;
  }
}

/**
 * Selects a mood value (1-5).
 */
function selectMood(value) {
  state.selectedMood = value;
  document.querySelectorAll('.mood-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i + 1 === value);
  });
}

/**
 * Selects an energy level (1-5).
 */
function selectEnergy(value) {
  state.selectedEnergy = value;
  document.querySelectorAll('.energy-bar').forEach((bar, i) => {
    bar.classList.toggle('active', i + 1 === value);
  });
}

/**
 * Logs or updates today's mood via the API.
 */
async function logMood() {
  if (state.selectedMood === 0) {
    showToast('Please select your mood', 'warning');
    return;
  }
  const note = document.getElementById('mood-note')?.value || '';
  try {
    await apiRequest('/mood', {
      method: 'POST',
      body: JSON.stringify({
        mood: state.selectedMood,
        energyLevel: state.selectedEnergy,
        note
      })
    });
    showToast('Mood logged! 🌟', 'success');
    renderMood();
  } catch (err) { showToast(err.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════════════════════
//  FOCUS TIMER VIEW (Pomodoro)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Focus Timer (Pomodoro) view with start/pause/reset controls.
 */
function renderFocus() {
  const content = document.getElementById('page-content');

  // Progress ring SVG
  const circumference = 2 * Math.PI * 90; // r=90
  const progress = state.focusRunning
    ? ((state.focusTotalTime - state.focusTimeLeft) / state.focusTotalTime) * circumference
    : 0;

  content.innerHTML = `
    <div class="page-section">
      <div class="focus-container">
        <!-- Mode Selector -->
        <div class="focus-mode-selector">
          <button class="focus-mode-btn ${state.focusMode === 'focus' ? 'active' : ''}" onclick="setFocusMode('focus')">
            <i class="fas fa-brain"></i> Focus (25m)
          </button>
          <button class="focus-mode-btn ${state.focusMode === 'shortBreak' ? 'active' : ''}" onclick="setFocusMode('shortBreak')">
            <i class="fas fa-coffee"></i> Short Break (5m)
          </button>
          <button class="focus-mode-btn ${state.focusMode === 'longBreak' ? 'active' : ''}" onclick="setFocusMode('longBreak')">
            <i class="fas fa-bed"></i> Long Break (15m)
          </button>
        </div>

        <!-- Timer -->
        <div class="focus-timer">
          <div class="focus-progress-ring">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle class="bg" cx="100" cy="100" r="90"/>
              <circle class="progress" cx="100" cy="100" r="90"
                      stroke-dasharray="${circumference}"
                      stroke-dashoffset="${circumference - progress}"
                      id="focus-progress"/>
            </svg>
          </div>
          <div class="focus-timer-display" id="focus-display">${formatTime(state.focusTimeLeft)}</div>
          <div class="focus-timer-controls">
            <button class="btn ${state.focusRunning ? 'btn-danger' : 'btn-primary'}" onclick="toggleFocusTimer()" id="focus-toggle-btn">
              <i class="fas ${state.focusRunning ? 'fa-pause' : 'fa-play'}"></i>
              ${state.focusRunning ? 'Pause' : 'Start'}
            </button>
            <button class="btn btn-secondary" onclick="resetFocusTimer()">
              <i class="fas fa-redo"></i> Reset
            </button>
          </div>
          <p style="color:var(--text-muted);font-size:0.85rem" id="focus-status">
            ${state.focusRunning ? '🎯 Stay focused!' : state.focusTimeLeft === 0 ? '✅ Session complete!' : '⏸️ Ready to start'}
          </p>
        </div>

        <!-- Stats -->
        <div class="focus-stats">
          <div class="focus-stat">
            <div class="focus-stat-value">${Math.round((state.user?.stats?.totalFocusMinutes || 0) / 60)}h</div>
            <div class="focus-stat-label">Total Focused</div>
          </div>
          <div class="focus-stat">
            <div class="focus-stat-value">${Math.round((state.user?.stats?.totalFocusMinutes || 0) / 25)}</div>
            <div class="focus-stat-label">Sessions</div>
          </div>
          <div class="focus-stat">
            <div class="focus-stat-value">${state.user?.stats?.currentStreak || 0}d</div>
            <div class="focus-stat-label">Streak</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sets the focus timer mode (focus, shortBreak, longBreak).
 */
function setFocusMode(mode) {
  if (state.focusRunning) {
    clearInterval(state.focusInterval);
    state.focusRunning = false;
  }
  state.focusMode = mode;
  const durations = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  state.focusTimeLeft = durations[mode] || 25 * 60;
  state.focusTotalTime = state.focusTimeLeft;
  renderFocus();
}

/**
 * Toggles the focus timer start/pause.
 */
function toggleFocusTimer() {
  if (state.focusRunning) {
    // Pause
    clearInterval(state.focusInterval);
    state.focusRunning = false;
    document.getElementById('focus-toggle-btn').innerHTML = '<i class="fas fa-play"></i> Resume';
    document.getElementById('focus-status').textContent = '⏸️ Paused';
  } else {
    // Start/Resume
    state.focusRunning = true;
    document.getElementById('focus-toggle-btn').innerHTML = '<i class="fas fa-pause"></i> Pause';
    document.getElementById('focus-toggle-btn').className = 'btn btn-danger';
    document.getElementById('focus-status').textContent = '🎯 Stay focused!';

    state.focusInterval = setInterval(() => {
      state.focusTimeLeft--;
      const display = document.getElementById('focus-display');
      const progress = document.getElementById('focus-progress');
      if (display) display.textContent = formatTime(state.focusTimeLeft);

      // Update progress ring
      if (progress) {
        const circumference = 2 * Math.PI * 90;
        const offset = circumference - ((state.focusTotalTime - state.focusTimeLeft) / state.focusTotalTime) * circumference;
        progress.style.strokeDashoffset = offset;
      }

      // Timer completed
      if (state.focusTimeLeft <= 0) {
        clearInterval(state.focusInterval);
        state.focusRunning = false;
        document.getElementById('focus-status').textContent = '✅ Session complete! Great work! 🎉';
        document.getElementById('focus-toggle-btn').innerHTML = '<i class="fas fa-play"></i> Start';
        document.getElementById('focus-toggle-btn').className = 'btn btn-primary';

        // Record focus session
        if (state.focusMode === 'focus') {
          apiRequest('/dashboard/focus/complete', {
            method: 'POST',
            body: JSON.stringify({ duration: state.focusTotalTime, type: 'focus' })
          }).catch(() => {});
          showToast('🎉 Focus session complete!', 'success', 5000);
        }
        renderFocus();
      }
    }, 1000);
  }
}

/**
 * Resets the focus timer to the beginning.
 */
function resetFocusTimer() {
  if (state.focusRunning) {
    clearInterval(state.focusInterval);
    state.focusRunning = false;
  }
  const durations = { focus: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  state.focusTimeLeft = durations[state.focusMode] || 25 * 60;
  state.focusTotalTime = state.focusTimeLeft;
  renderFocus();
  document.getElementById('focus-status').textContent = '🔄 Reset';
}

// ═════════════════════════════════════════════════════════════════════════════
//  SMART INSIGHTS VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Smart Insights page with AI-powered productivity recommendations.
 */
async function renderInsights() {
  try {
    const data = await apiRequest('/dashboard/insights');
    state.insights = data.insights || [];

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <div class="section-header">
          <h3>🧠 AI-Powered Insights</h3>
          <button class="btn btn-sm btn-ghost" onclick="renderInsights()">
            <i class="fas fa-sync"></i> Refresh
          </button>
        </div>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:1.5rem">
          Aria analyzes your activity patterns to provide personalized productivity insights.
        </p>
        <div class="insights-grid">
          ${state.insights.length > 0 ? state.insights.map(insight => `
            <div class="insight-card ${insight.type}">
              <div class="insight-card-header">
                <div class="insight-card-icon">${insight.icon || '💡'}</div>
                <div>
                  <div class="insight-card-title">${insight.title}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);text-transform:capitalize">${insight.type}</div>
                </div>
              </div>
              <div class="insight-card-desc">${insight.description}</div>
              ${insight.action ? `
                <div class="insight-card-action">
                  <button class="btn btn-sm ${insight.type === 'warning' ? 'btn-danger' : insight.type === 'achievement' ? 'btn-success' : 'btn-primary'}" onclick="showToast('${escapeHtml(insight.action)}', 'info')">
                    ${insight.action}
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('') : `
            <div class="empty-state" style="grid-column:1/-1">
              <i class="fas fa-lightbulb"></i>
              <h3>No insights yet</h3>
              <p>Create notes and tasks to get personalized AI insights!</p>
            </div>
          `}
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-lightbulb"></i><h3>Smart Insights</h3><p>${err.message}</p></div>`;
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//  CALENDAR VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders a calendar view showing tasks with due dates.
 */
function renderCalendar() {
  const year = state.calendarDate.getFullYear();
  const month = state.calendarDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get tasks with due dates for this month
  const taskDates = new Set();
  if (state.kanbanData) {
    Object.values(state.kanbanData).flat().forEach(t => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d.getMonth() === month && d.getFullYear() === year) {
          taskDates.add(d.getDate());
        }
      }
    });
  }

  // Build calendar grid
  let days = '';
  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(year, month, -startDay + i + 1);
    days += `<div class="calendar-day other-month">${prevDate.getDate()}</div>`;
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const hasEvent = taskDates.has(d);
    days += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" onclick="showToast('${monthNames[month]} ${d}, ${year}${hasEvent ? ' — has tasks' : ''}', 'info')">${d}</div>`;
  }
  // Next month padding
  const totalCells = startDay + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remaining; i++) {
    days += `<div class="calendar-day other-month">${i}</div>`;
  }

  const content = document.getElementById('page-content');
  content.innerHTML = `
    <div class="page-section">
      <div class="calendar-container">
        <div class="calendar-header">
          <button class="calendar-nav-btn" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
          <h3>${monthNames[month]} ${year}</h3>
          <button class="calendar-nav-btn" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
          ${dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
          ${days}
        </div>
        <div style="margin-top:1rem;text-align:center;color:var(--text-muted);font-size:0.85rem">
          <span class="calendar-day has-event" style="display:inline-flex;width:12px;height:12px;margin-right:0.25rem;vertical-align:middle"></span> Has tasks
        </div>
      </div>
    </div>
  `;
}

/**
 * Navigates the calendar by delta months.
 */
function changeMonth(delta) {
  state.calendarDate.setMonth(state.calendarDate.getMonth() + delta);
  renderCalendar();
}

// ═════════════════════════════════════════════════════════════════════════════
//  SETTINGS VIEW
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the Settings page with all user preferences.
 */
async function renderSettings() {
  try {
    const data = await apiRequest('/settings');
    const s = data.settings || {};

    const content = document.getElementById('page-content');
    content.innerHTML = `
      <div class="page-section">
        <div class="settings-container">
          <!-- Profile -->
          <div class="settings-section">
            <h3><i class="fas fa-user" style="color:var(--primary)"></i> Profile</h3>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Display Name</div>
                <div class="setting-desc">How others see you</div>
              </div>
              <input type="text" id="setting-display-name" value="${escapeHtml(state.user?.displayName || state.user?.username || '')}"
                     style="width:160px;padding:0.5rem;border:2px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text);font-family:inherit">
            </div>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Bio</div>
                <div class="setting-desc">A short description about yourself</div>
              </div>
              <input type="text" id="setting-bio" value="${escapeHtml(state.user?.bio || '')}"
                     style="width:200px;padding:0.5rem;border:2px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text);font-family:inherit">
            </div>
            <div class="setting-row">
              <button class="btn btn-primary btn-sm" onclick="updateProfile()">
                <i class="fas fa-save"></i> Save Profile
              </button>
            </div>
          </div>

          <!-- Appearance -->
          <div class="settings-section">
            <h3><i class="fas fa-palette" style="color:var(--accent)"></i> Appearance</h3>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Theme</div>
                <div class="setting-desc">Light, dark, or system default</div>
              </div>
              <select id="setting-theme" onchange="changeTheme(this.value)" style="padding:0.5rem;border:2px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text)">
                <option value="light" ${s.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="system" ${s.theme === 'system' ? 'selected' : ''}>System</option>
              </select>
            </div>
          </div>

          <!-- Focus Timer -->
          <div class="settings-section">
            <h3><i class="fas fa-clock" style="color:var(--success)"></i> Focus Timer</h3>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Focus Duration</div>
                <div class="setting-desc">Minutes per focus session</div>
              </div>
              <input type="number" id="setting-focus-duration" value="${s.focusDuration || 25}" min="1" max="120"
                     style="width:80px;padding:0.5rem;border:2px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text)">
            </div>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Short Break</div>
                <div class="setting-desc">Minutes per short break</div>
              </div>
              <input type="number" id="setting-short-break" value="${s.shortBreakDuration || 5}" min="1" max="30"
                     style="width:80px;padding:0.5rem;border:2px solid var(--border);border-radius:8px;background:var(--bg-input);color:var(--text)">
            </div>
            <div class="setting-row">
              <button class="btn btn-primary btn-sm" onclick="updateSettings()">
                <i class="fas fa-save"></i> Save Settings
              </button>
            </div>
          </div>

          <!-- Data -->
          <div class="settings-section">
            <h3><i class="fas fa-database" style="color:var(--warning)"></i> Data Management</h3>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Export Data</div>
                <div class="setting-desc">Download all your data as JSON</div>
              </div>
              <button class="btn btn-sm btn-secondary" onclick="exportData()">
                <i class="fas fa-download"></i> Export
              </button>
            </div>
            <div class="setting-row">
              <div class="setting-info">
                <div class="setting-label">Clear Data</div>
                <div class="setting-desc">Remove all notes and tasks (cannot be undone)</div>
              </div>
              <button class="btn btn-sm btn-danger" onclick="showToast('Data clearing is simulated for safety', 'warning')">
                <i class="fas fa-trash"></i> Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById('page-content').innerHTML = `<div class="empty-state"><i class="fas fa-cog"></i><h3>Settings</h3><p>${err.message}</p></div>`;
  }
}

/**
 * Updates the user profile (display name, bio).
 */
async function updateProfile() {
  const displayName = document.getElementById('setting-display-name').value.trim();
  const bio = document.getElementById('setting-bio').value;
  try {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ displayName, bio })
    });
    state.user = data.user;
    document.getElementById('sidebar-username').textContent = state.user.displayName || state.user.username;
    showToast('Profile updated!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Changes the theme and persists it.
 */
function changeTheme(theme) {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  document.getElementById('theme-icon').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  localStorage.setItem('aria_theme', theme);
  apiRequest('/settings/theme', { method: 'PUT', body: JSON.stringify({ theme }) }).catch(() => {});
}

/**
 * Updates settings (focus durations, etc.).
 */
async function updateSettings() {
  try {
    await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify({
        focusDuration: parseInt(document.getElementById('setting-focus-duration').value) || 25,
        shortBreakDuration: parseInt(document.getElementById('setting-short-break').value) || 5
      })
    });
    showToast('Settings saved!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

/**
 * Exports all user data as a downloadable JSON file.
 */
async function exportData() {
  try {
    const data = await apiRequest('/export');
    const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aria-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE OVERLAY
// ═════════════════════════════════════════════════════════════════════════════

function showProfile() {
  const u = state.user;
  if (!u) return;
  openModal(`
    <div class="quick-form">
      <div style="text-align:center;padding:1rem 0">
        <div style="width:80px;height:80px;border-radius:20px;background:var(--gradient);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:2rem;color:white;font-weight:700">
          ${(u.displayName || u.username || 'U')[0].toUpperCase()}
        </div>
        <h3 style="font-size:1.25rem">${escapeHtml(u.displayName || u.username)}</h3>
        <p style="color:var(--text-muted);font-size:0.85rem">${escapeHtml(u.email)}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin:1rem 0">
        <div class="stat-card" style="cursor:default;padding:1rem;text-align:center">
          <div class="stat-value" style="font-size:1.25rem">${u.stats?.totalNotes || 0}</div>
          <div class="stat-label">Notes</div>
        </div>
        <div class="stat-card" style="cursor:default;padding:1rem;text-align:center">
          <div class="stat-value" style="font-size:1.25rem">${u.stats?.completedTasks || 0}</div>
          <div class="stat-label">Tasks Done</div>
        </div>
        <div class="stat-card" style="cursor:default;padding:1rem;text-align:center">
          <div class="stat-value" style="font-size:1.25rem">${u.stats?.currentStreak || 0}d</div>
          <div class="stat-label">Streak</div>
        </div>
        <div class="stat-card" style="cursor:default;padding:1rem;text-align:center">
          <div class="stat-value" style="font-size:1.25rem">${Math.round((u.stats?.totalFocusMinutes || 0) / 60)}h</div>
          <div class="stat-label">Focused</div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" onclick="closeModal();navigateTo('settings')">
          <i class="fas fa-cog"></i> Settings
        </button>
      </div>
    </div>
  `);
}

// ═════════════════════════════════════════════════════════════════════════════
//  QUICK ACTIONS (Top Bar Buttons)
// ═════════════════════════════════════════════════════════════════════════════

function showQuickNote() {
  showCreateNote();
}

function showQuickTask() {
  showCreateTask();
}

// ═════════════════════════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ═════════════════════════════════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  // Ctrl+N → New Note
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    if (state.token) showQuickNote();
  }
  // Ctrl+T → New Task
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    e.preventDefault();
    if (state.token) showQuickTask();
  }
  // Ctrl+D → Dashboard
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    if (state.token) navigateTo('dashboard');
  }
  // Ctrl+Shift+F → Focus Timer
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    if (state.token) navigateTo('focus');
  }
  // Escape → Close modal
  if (e.key === 'Escape') {
    closeModal();
  }
});

// ═════════════════════════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Escapes HTML special characters to prevent XSS.
 * @param {string} str - Input string
 * @returns {string} Escaped string safe for innerHTML
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Formats a date string into a human-readable relative time ("2 hours ago").
 * @param {string} dateStr - ISO date string
 * @returns {string} Relative time description
 */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Formats seconds into MM:SS display format.
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (MM:SS)
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Formats seconds into a human-readable duration.
 * @param {number} seconds - Total seconds
 * @returns {string} e.g., "2 min 30 sec"
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '< 1 sec';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m} min ${s} sec`;
  return `${s} sec`;
}

/**
 * Formats a date string into a readable date.
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) { return dateStr; }
}

// ═════════════════════════════════════════════════════════════════════════════
//  INITIALIZATION
// ═════════════════════════════════════════════════════════════════════════════

// Restore theme from localStorage
const savedTheme = localStorage.getItem('aria_theme');
if (savedTheme) {
  if (savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  document.getElementById('theme-icon').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ═════════════════════════════════════════════════════════════════════════════
//  END OF APPLICATION
// ═════════════════════════════════════════════════════════════════════════════
