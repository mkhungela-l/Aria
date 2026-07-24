/**
 * Aria Database Module
 * 
 * Persistent JSON-file-based storage engine.
 * Provides CRUD operations for users, notes, tasks, voice recordings, moods, and settings.
 * All data is stored in a single JSON file with automatic saving on mutations.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'aria-db.json');

// ─── Default Database Structure ───────────────────────────────────────────────
const DEFAULT_DB = {
  users: {},
  notes: {},
  tasks: {},
  voiceRecordings: {},
  moods: {},
  settings: {},
  sessions: {}
};

let db = null;

/**
 * Loads the database from disk, creating a default one if none exists.
 * @returns {object} The database object
 */
function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
      // Ensure all top-level keys exist
      for (const key of Object.keys(DEFAULT_DB)) {
        if (!db[key]) db[key] = {};
      }
    } else {
      db = JSON.parse(JSON.stringify(DEFAULT_DB));
      saveDB();
    }
  } catch (err) {
    console.error('[DB] Error loading database, creating fresh:', err.message);
    db = JSON.parse(JSON.stringify(DEFAULT_DB));
    saveDB();
  }
  return db;
}

/**
 * Persists the current database state to disk.
 */
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error saving database:', err.message);
  }
}

// Initialize database on module load
loadDB();

// ─── Helper: Get current timestamp ──────────────────────────────────────────
function now() {
  return new Date().toISOString();
}

// ─── User Operations ──────────────────────────────────────────────────────────
const users = {
  create({ username, email, passwordHash }) {
    const id = uuidv4();
    db.users[id] = {
      id,
      username,
      email,
      passwordHash,
      displayName: username,
      avatar: null,
      bio: '',
      createdAt: now(),
      updatedAt: now(),
      lastLoginAt: null,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true,
        focusDuration: 25, // Pomodoro minutes
        shortBreakDuration: 5,
        longBreakDuration: 15
      },
      stats: {
        totalNotes: 0,
        totalTasks: 0,
        completedTasks: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalFocusMinutes: 0,
        voiceNotesCreated: 0
      }
    };
    saveDB();
    return db.users[id];
  },

  findByEmail(email) {
    return Object.values(db.users).find(u => u.email === email) || null;
  },

  findByUsername(username) {
    return Object.values(db.users).find(u => u.username === username) || null;
  },

  findById(id) {
    return db.users[id] || null;
  },

  update(id, updates) {
    if (!db.users[id]) return null;
    const allowed = ['displayName', 'bio', 'avatar', 'preferences'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        db.users[id][key] = updates[key];
      }
    }
    if (updates.stats) {
      Object.assign(db.users[id].stats, updates.stats);
    }
    db.users[id].updatedAt = now();
    saveDB();
    return db.users[id];
  },

  recordLogin(id) {
    if (db.users[id]) {
      db.users[id].lastLoginAt = now();
      saveDB();
    }
  },

  updateStreak(id) {
    const user = db.users[id];
    if (!user) return;
    const today = new Date().toDateString();
    const lastActive = user.stats.lastActiveDate || '';
    if (lastActive === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActive === yesterday) {
      user.stats.currentStreak += 1;
    } else if (lastActive !== today) {
      user.stats.currentStreak = 1;
    }
    user.stats.lastActiveDate = today;
    if (user.stats.currentStreak > user.stats.longestStreak) {
      user.stats.longestStreak = user.stats.currentStreak;
    }
    saveDB();
  }
};

// ─── Notes Operations ─────────────────────────────────────────────────────────
const notes = {
  create({ userId, title, content, tags, category, isPinned, color, richContent }) {
    const id = uuidv4();
    db.notes[id] = {
      id,
      userId,
      title: title || 'Untitled Note',
      content: content || '',
      richContent: richContent || '',
      tags: tags || [],
      category: category || 'general',
      isPinned: isPinned || false,
      color: color || '#ffffff',
      isArchived: false,
      isTrashed: false,
      wordCount: (content || '').split(/\s+/).filter(Boolean).length,
      createdAt: now(),
      updatedAt: now(),
      trashedAt: null
    };
    // Update user stats
    if (db.users[userId]) {
      db.users[userId].stats.totalNotes += 1;
    }
    saveDB();
    return db.notes[id];
  },

  findByUser(userId, options = {}) {
    let result = Object.values(db.notes).filter(n => n.userId === userId);
    // Filter by trash/archive status
    if (options.trashed) {
      result = result.filter(n => n.isTrashed);
    } else if (options.archived) {
      result = result.filter(n => n.isArchived && !n.isTrashed);
    } else {
      result = result.filter(n => !n.isArchived && !n.isTrashed);
    }
    // Filter by category
    if (options.category) {
      result = result.filter(n => n.category === options.category);
    }
    // Filter by tag
    if (options.tag) {
      result = result.filter(n => n.tags.includes(options.tag));
    }
    // Search
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    // Sort: pinned first, then by updatedAt
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return result;
  },

  findById(id) {
    return db.notes[id] || null;
  },

  update(id, updates) {
    if (!db.notes[id]) return null;
    const allowed = ['title', 'content', 'richContent', 'tags', 'category', 'isPinned', 'color', 'isArchived'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        db.notes[id][key] = updates[key];
      }
    }
    if (updates.content !== undefined) {
      db.notes[id].wordCount = updates.content.split(/\s+/).filter(Boolean).length;
    }
    db.notes[id].updatedAt = now();
    saveDB();
    return db.notes[id];
  },

  trash(id) {
    if (!db.notes[id]) return null;
    db.notes[id].isTrashed = true;
    db.notes[id].trashedAt = now();
    db.notes[id].updatedAt = now();
    saveDB();
    return db.notes[id];
  },

  restore(id) {
    if (!db.notes[id]) return null;
    db.notes[id].isTrashed = false;
    db.notes[id].trashedAt = null;
    db.notes[id].updatedAt = now();
    saveDB();
    return db.notes[id];
  },

  deletePermanently(id) {
    const note = db.notes[id];
    if (!note) return false;
    if (db.users[note.userId]) {
      db.users[note.userId].stats.totalNotes -= 1;
    }
    delete db.notes[id];
    saveDB();
    return true;
  },

  getCategories(userId) {
    const userNotes = Object.values(db.notes).filter(n => n.userId === userId && !n.isTrashed);
    const cats = {};
    for (const n of userNotes) {
      cats[n.category] = (cats[n.category] || 0) + 1;
    }
    return cats;
  },

  getTags(userId) {
    const userNotes = Object.values(db.notes).filter(n => n.userId === userId && !n.isTrashed);
    const tagSet = {};
    for (const n of userNotes) {
      for (const tag of n.tags) {
        tagSet[tag] = (tagSet[tag] || 0) + 1;
      }
    }
    return tagSet;
  }
};

// ─── Tasks Operations ─────────────────────────────────────────────────────────
const tasks = {
  create({ userId, title, description, priority, dueDate, category, tags, listId, status }) {
    const id = uuidv4();
    const taskStatus = status || 'todo'; // Allow setting initial status
    db.tasks[id] = {
      id,
      userId,
      title,
      description: description || '',
      priority: priority || 'medium', // low, medium, high, urgent
      status: taskStatus, // todo, in-progress, review, done
      dueDate: dueDate || null,
      category: category || 'general',
      tags: tags || [],
      listId: listId || 'default',
      isRecurring: false,
      recurringRule: null,
      completedAt: taskStatus === 'done' ? now() : null,
      createdAt: now(),
      updatedAt: now(),
      order: Object.values(db.tasks).filter(t => t.userId === userId && t.status === 'todo').length
    };
    if (db.users[userId]) {
      db.users[userId].stats.totalTasks += 1;
      if (taskStatus === 'done') {
        db.users[userId].stats.completedTasks = (db.users[userId].stats.completedTasks || 0) + 1;
      }
    }
    saveDB();
    return db.tasks[id];
  },

  findByUser(userId, options = {}) {
    let result = Object.values(db.tasks).filter(t => t.userId === userId);
    // Filter by status
    if (options.status) {
      result = result.filter(t => t.status === options.status);
    }
    // Filter by priority
    if (options.priority) {
      result = result.filter(t => t.priority === options.priority);
    }
    // Filter by category
    if (options.category) {
      result = result.filter(t => t.category === options.category);
    }
    // Search
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    // Sort
    result.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const pOrder = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pOrder !== 0) return pOrder;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    return result;
  },

  findById(id) {
    return db.tasks[id] || null;
  },

  update(id, updates) {
    if (!db.tasks[id]) return null;
    const allowed = ['title', 'description', 'priority', 'status', 'dueDate', 'category', 'tags', 'listId', 'order'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        db.tasks[id][key] = updates[key];
      }
    }
    // Handle completion
    if (updates.status === 'done' && !db.tasks[id].completedAt) {
      db.tasks[id].completedAt = now();
      if (db.users[db.tasks[id].userId]) {
        db.users[db.tasks[id].userId].stats.completedTasks += 1;
      }
    } else if (updates.status && updates.status !== 'done') {
      db.tasks[id].completedAt = null;
    }
    db.tasks[id].updatedAt = now();
    saveDB();
    return db.tasks[id];
  },

  delete(id) {
    const task = db.tasks[id];
    if (!task) return false;
    if (db.users[task.userId]) {
      db.users[task.userId].stats.totalTasks -= 1;
      if (task.status === 'done') {
        db.users[task.userId].stats.completedTasks -= 1;
      }
    }
    delete db.tasks[id];
    saveDB();
    return true;
  },

  // Kanban: Get tasks grouped by status
  getKanbanData(userId) {
    const tasks = Object.values(db.tasks).filter(t => t.userId === userId);
    return {
      todo: tasks.filter(t => t.status === 'todo').sort((a, b) => (a.order || 0) - (b.order || 0)),
      'in-progress': tasks.filter(t => t.status === 'in-progress'),
      review: tasks.filter(t => t.status === 'review'),
      done: tasks.filter(t => t.status === 'done')
    };
  },

  // Update task order within a kanban column
  reorder(taskId, newStatus, newOrder) {
    const task = db.tasks[taskId];
    if (!task) return false;
    task.status = newStatus;
    task.order = newOrder;
    task.updatedAt = now();
    saveDB();
    return true;
  }
};

// ─── Voice Recordings Operations ──────────────────────────────────────────────
const voiceRecordings = {
  create({ userId, title, duration, transcription, filePath, fileSize, tags }) {
    const id = uuidv4();
    db.voiceRecordings[id] = {
      id,
      userId,
      title: title || 'Voice Recording',
      duration: duration || 0, // seconds
      transcription: transcription || '',
      filePath: filePath || '',
      fileSize: fileSize || 0,
      tags: tags || [],
      isProcessed: !!transcription,
      createdAt: now(),
      updatedAt: now()
    };
    if (db.users[userId]) {
      db.users[userId].stats.voiceNotesCreated += 1;
    }
    saveDB();
    return db.voiceRecordings[id];
  },

  findByUser(userId) {
    return Object.values(db.voiceRecordings)
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findById(id) {
    return db.voiceRecordings[id] || null;
  },

  update(id, updates) {
    if (!db.voiceRecordings[id]) return null;
    const allowed = ['title', 'transcription', 'tags', 'isProcessed'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        db.voiceRecordings[id][key] = updates[key];
      }
    }
    db.voiceRecordings[id].updatedAt = now();
    saveDB();
    return db.voiceRecordings[id];
  },

  delete(id) {
    const rec = db.voiceRecordings[id];
    if (!rec) return false;
    // Delete file if it exists
    if (rec.filePath && fs.existsSync(rec.filePath)) {
      try { fs.unlinkSync(rec.filePath); } catch (e) { /* ignore */ }
    }
    delete db.voiceRecordings[id];
    saveDB();
    return true;
  }
};

// ─── Mood Tracking Operations ─────────────────────────────────────────────────
const moods = {
  log({ userId, mood, note, energyLevel }) {
    const today = new Date().toISOString().split('T')[0];
    // Check if already logged today
    const existing = Object.values(db.moods).find(
      m => m.userId === userId && m.date === today
    );
    if (existing) {
      existing.mood = mood;
      existing.note = note || existing.note;
      existing.energyLevel = energyLevel !== undefined ? energyLevel : existing.energyLevel;
      existing.updatedAt = now();
      saveDB();
      return existing;
    }
    const id = uuidv4();
    db.moods[id] = {
      id,
      userId,
      date: today,
      mood, // 1-5 scale
      note: note || '',
      energyLevel: energyLevel || 3, // 1-5 scale
      createdAt: now(),
      updatedAt: now()
    };
    saveDB();
    return db.moods[id];
  },

  getByUser(userId, days = 30) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return Object.values(db.moods)
      .filter(m => m.userId === userId && m.date >= cutoff)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getStreak(userId) {
    const entries = Object.values(db.moods)
      .filter(m => m.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);
    for (const entry of entries) {
      if (entry.date === checkDate.toISOString().split('T')[0]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entry.date === checkDate.toISOString().split('T')[0]) {
        // Already advanced above
      } else {
        break;
      }
    }
    // Check if today is logged
    const todayEntry = entries.find(e => e.date === today);
    if (!todayEntry) return 0;
    return streak;
  }
};

// ─── Settings Operations ──────────────────────────────────────────────────────
const settings = {
  get(userId) {
    return db.settings[userId] || null;
  },

  update(userId, updates) {
    if (!db.settings[userId]) {
      db.settings[userId] = {
        userId,
        theme: 'light',
        language: 'en',
        timeFormat: '12h',
        dateFormat: 'MM/DD/YYYY',
        weekStartsOn: 'monday',
        notificationsEnabled: true,
        emailDigest: false,
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        dailyGoal: 4,
        createdAt: now(),
        updatedAt: now()
      };
    }
    const allowed = ['theme', 'language', 'timeFormat', 'dateFormat', 'weekStartsOn',
      'notificationsEnabled', 'emailDigest', 'focusDuration', 'shortBreakDuration',
      'longBreakDuration', 'dailyGoal'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        db.settings[userId][key] = updates[key];
      }
    }
    db.settings[userId].updatedAt = now();
    saveDB();
    return db.settings[userId];
  }
};

// ─── Session Management ───────────────────────────────────────────────────────
const sessions = {
  create(userId, token) {
    db.sessions[token] = {
      userId,
      createdAt: now(),
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() // 7 days
    };
    saveDB();
    return db.sessions[token];
  },

  findByToken(token) {
    const session = db.sessions[token];
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      delete db.sessions[token];
      saveDB();
      return null;
    }
    return session;
  },

  delete(token) {
    delete db.sessions[token];
    saveDB();
  },

  deleteUserSessions(userId) {
    for (const [token, session] of Object.entries(db.sessions)) {
      if (session.userId === userId) {
        delete db.sessions[token];
      }
    }
    saveDB();
  }
};

// ─── Export / Utility ────────────────────────────────────────────────────────
function exportUserData(userId) {
  return {
    user: db.users[userId] || null,
    notes: Object.values(db.notes).filter(n => n.userId === userId),
    tasks: Object.values(db.tasks).filter(t => t.userId === userId),
    voiceRecordings: Object.values(db.voiceRecordings).filter(r => r.userId === userId),
    moods: Object.values(db.moods).filter(m => m.userId === userId),
    settings: db.settings[userId] || null,
    exportedAt: now()
  };
}

function importUserData(userId, data) {
  // Reject if user doesn't exist
  if (!db.users[userId]) return { success: false, error: 'User not found' };
  let imported = { notes: 0, tasks: 0 };
  // Import notes
  if (data.notes && Array.isArray(data.notes)) {
    for (const n of data.notes) {
      const id = n.id || uuidv4();
      db.notes[id] = { ...n, id, userId, updatedAt: now() };
      imported.notes++;
    }
  }
  // Import tasks
  if (data.tasks && Array.isArray(data.tasks)) {
    for (const t of data.tasks) {
      const id = t.id || uuidv4();
      db.tasks[id] = { ...t, id, userId, updatedAt: now() };
      imported.tasks++;
    }
  }
  saveDB();
  return { success: true, imported };
}

// ─── Analytics / Dashboard ──────────────────────────────────────────────────
function getDashboardStats(userId) {
  const user = db.users[userId];
  if (!user) return null;

  const userNotes = Object.values(db.notes).filter(n => n.userId === userId && !n.isTrashed);
  const activeNotes = userNotes.filter(n => !n.isArchived);
  const archivedNotes = userNotes.filter(n => n.isArchived);
  const trashedNotes = Object.values(db.notes).filter(n => n.userId === userId && n.isTrashed);

  const userTasks = Object.values(db.tasks).filter(t => t.userId === userId);
  const todoTasks = userTasks.filter(t => t.status === 'todo');
  const inProgressTasks = userTasks.filter(t => t.status === 'in-progress');
  const doneTasks = userTasks.filter(t => t.status === 'done');
  const overdueTasks = userTasks.filter(t =>
    t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()
  );

  const voiceNotes = Object.values(db.voiceRecordings).filter(r => r.userId === userId);

  // Recent activity
  const recentItems = [
    ...userNotes.map(n => ({ type: 'note', id: n.id, title: n.title, date: n.updatedAt })),
    ...userTasks.map(t => ({ type: 'task', id: t.id, title: t.title, date: t.updatedAt })),
    ...voiceNotes.map(v => ({ type: 'voice', id: v.id, title: v.title, date: v.createdAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  // Weekly activity data (for chart)
  const weeklyActivity = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const notesCreated = Object.values(db.notes).filter(n =>
      n.userId === userId && n.createdAt.startsWith(day)
    ).length;
    const tasksCompleted = Object.values(db.tasks).filter(t =>
      t.userId === userId && t.completedAt && t.completedAt.startsWith(day)
    ).length;
    weeklyActivity.push({ date: day, notesCreated, tasksCompleted });
  }

  return {
    overview: {
      totalNotes: userNotes.length,
      activeNotes: activeNotes.length,
      archivedNotes: archivedNotes.length,
      trashedNotes: trashedNotes.length,
      totalTasks: userTasks.length,
      todoTasks: todoTasks.length,
      inProgressTasks: inProgressTasks.length,
      doneTasks: doneTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate: userTasks.length > 0
        ? Math.round((doneTasks.length / userTasks.length) * 100)
        : 0,
      voiceNotesCount: voiceNotes.length,
      totalFocusMinutes: user.stats.totalFocusMinutes || 0,
      currentStreak: user.stats.currentStreak || 0,
      longestStreak: user.stats.longestStreak || 0
    },
    recentActivity: recentItems,
    weeklyActivity,
    // Priority breakdown for tasks
    priorityBreakdown: {
      urgent: userTasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
      high: userTasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
      medium: userTasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
      low: userTasks.filter(t => t.priority === 'low' && t.status !== 'done').length
    },
    // Category breakdown
    categoryBreakdown: notes.getCategories(userId)
  };
}

module.exports = {
  users,
  notes,
  tasks,
  voiceRecordings,
  moods,
  settings,
  sessions,
  exportUserData,
  importUserData,
  getDashboardStats,
  saveDB,
  loadDB
};
