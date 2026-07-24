# ✨ Aria — AI-Powered Productivity Suite

> **Aria** is a full-stack, feature-rich productivity application that combines notes, tasks, voice recordings, mood tracking, focus timer, and AI-driven insights into one seamless experience.

![Version](https://img.shields.io/badge/version-2.0.0-blueviolet)
![Node](https://img.shields.io/badge/node-%3E%3D18-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Quick Start

```bash
npm install
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🌟 Features

### 📝 Smart Notes
| Feature | Description |
|---|---|
| Create & Edit | Rich notes with titles, content, and categories |
| Tags | Organize with custom tags and categories |
| Pin Notes | Keep important notes at the top |
| Color Coding | Assign colors to notes for visual organization |
| Archive/Trash | Soft-delete with restore capability |
| Search | Full-text search across all notes |

### ✅ Kanban Tasks
| Feature | Description |
|---|---|
| Four Columns | Todo → In Progress → Review → Done |
| Drag & Drop | Move tasks between status columns |
| Priority Levels | Urgent, High, Medium, Low |
| Due Dates | Set deadlines with overdue detection |
| Categories | Group tasks by project or area |
| Completion Tracking | Automatic completion rate calculation |

### 🎙️ Voice Notes
| Feature | Description |
|---|---|
| Recording Simulation | One-click voice note capture |
| AI Transcription | Simulated smart transcription |
| History | Browse all past recordings |
| Playback | Quick audio review |

### 😊 Mood Tracker
| Feature | Description |
|---|---|
| Daily Check-in | Rate mood 1-5 with emoji selector |
| Energy Level | Track your energy alongside mood |
| Journal Notes | Add context to your entries |
| Streak Tracking | Maintain your logging streak |
| Analytics | Average mood and energy over time |

### ⏱️ Focus Timer (Pomodoro)
| Feature | Description |
|---|---|
| Custom Durations | 25 min focus, 5 min short break, 15 min long break |
| Visual Progress | Animated ring timer |
| Session Tracking | Auto-records completed sessions |
| Stats Dashboard | Total focus time, sessions completed |

### 🧠 AI Smart Insights
| Feature | Description |
|---|---|
| Productivity Analysis | Task completion rates and patterns |
| Anomaly Detection | Overdue tasks, missed goals |
| Achievement Tracking | Streaks, milestones, consistency |
| Actionable Tips | Context-aware productivity recommendations |

### 📊 Dashboard
| Feature | Description |
|---|---|
| Overview Stats | Notes, tasks, streaks, focus time |
| Weekly Chart | Visual activity bars for notes and tasks |
| Recent Activity | Feed of latest actions |
| Priority Breakdown | Visual distribution of task priorities |
| Quick Insights | AI-powered cards on the main view |

### 🎨 Theme & Customization
| Feature | Description |
|---|---|
| Dark/Light Mode | Toggle with one click, persisted across sessions |
| Responsive Design | Works on desktop, tablet, and mobile |
| Keyboard Shortcuts | `Ctrl+N` new note, `Ctrl+T` new task, `Ctrl+D` dashboard |
| User Profile | Display name, bio, avatar |

### 🔒 Data Management
| Feature | Description |
|---|---|
| JWT Authentication | Secure token-based auth with bcrypt password hashing |
| Data Export | Download all your data as JSON |
| Session Management | 7-day sessions with auto-expiry |
| Backend API | RESTful with proper error handling |

---

## 🏗️ Architecture

```
Aria/
├── server.js              # Express server (entry point)
├── package.json           # Dependencies & scripts
├── data/
│   └── database.js        # JSON file-based storage engine
├── routes/
│   ├── auth.js            # Registration, login, profile
│   ├── notes.js           # Notes CRUD, categories, tags
│   ├── tasks.js           # Tasks CRUD, Kanban, reorder
│   ├── voice.js           # Voice upload, transcription
│   ├── dashboard.js       # Stats, insights, activity
│   ├── settings.js        # User preferences
│   └── mood.js            # Mood tracking & history
├── public/
│   ├── index.html         # SPA entry point
│   ├── css/
│   │   └── style.css      # Complete design system
│   └── js/
│       └── app.js         # Full frontend application
└── data/
    └── (aria-db.json)     # Auto-created database file
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JavaScript SPA, HTML5, CSS3 |
| **Backend** | Node.js, Express.js |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Storage** | JSON file-based (portable, no DB setup) |
| **Design** | CSS custom properties, Glassmorphism, Responsive |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Notes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List notes (filter: `?category=&tag=&search=&archived=&trashed=`) |
| GET | `/api/notes/:id` | Get note by ID |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Soft delete (trash) |
| PUT | `/api/notes/:id/restore` | Restore from trash |
| DELETE | `/api/notes/:id/permanent` | Permanently delete |
| GET | `/api/notes/categories/all` | Get categories & tags |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (filter: `?status=&priority=&category=&search=`) |
| GET | `/api/tasks/kanban` | Get Kanban board data |
| GET | `/api/tasks/:id` | Get task by ID |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/reorder` | Move task (drag & drop) |
| DELETE | `/api/tasks/:id` | Delete task |

### Voice Notes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/voice/upload` | Upload audio file |
| POST | `/api/voice/transcribe` | Simulate transcription |
| GET | `/api/voice` | List recordings |
| GET | `/api/voice/:id` | Get recording |
| PUT | `/api/voice/:id` | Update recording |
| DELETE | `/api/voice/:id` | Delete recording |

### Dashboard & Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Full dashboard statistics |
| GET | `/api/dashboard/insights` | AI-powered insights |
| GET | `/api/dashboard/activity` | Activity heatmap data |
| POST | `/api/dashboard/focus/complete` | Record focus session |

### Mood & Settings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/mood` | Log today's mood |
| GET | `/api/mood` | Mood history (`?days=30`) |
| GET | `/api/mood/today` | Today's mood entry |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update settings |
| PUT | `/api/settings/theme` | Quick theme toggle |

### Data Management
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/export` | Export all user data |
| POST | `/api/import` | Import user data |
| GET | `/api/health` | Server health check |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl` + `N` | New Note |
| `Ctrl` + `T` | New Task |
| `Ctrl` + `D` | Dashboard |
| `Ctrl` + `Shift` + `F` | Focus Timer |
| `Escape` | Close Modal |

---

## 🎨 Design Highlights

- **Glassmorphism** — Frosted glass effects on cards and panels
- **Responsive Grids** — Auto-adapting layouts for any screen size
- **Micro-interactions** — Subtle hover, focus, and transition animations
- **Priority Colors** — Visual hierarchy with color-coded urgency
- **Dark Mode** — Full dark theme with preserved visual hierarchy
- **Gradient Accents** — Signature purple-to-pink gradient throughout

---

## 🔧 Development

```bash
# Start in development mode (auto-restart on changes)
npm run dev

# Or use standard mode
npm start
```

---

## 📝 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  Made with ❤️ by <strong>Aria</strong><br>
  <sub>Your AI-powered productivity companion</sub>
</p>
