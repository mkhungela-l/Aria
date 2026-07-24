/**
 * Aria Server - Main Entry Point
 * 
 * Express-based REST API server for the Aria productivity suite.
 * Serves the SPA frontend and provides all API endpoints for
 * authentication, notes, tasks, voice recordings, mood tracking,
 * and dashboard analytics.
 * 
 * @author Aria Team
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const { sessions } = require('./data/database');

// ─── Configuration ────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.ARIA_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aria-secret-key-change-in-production-abc123xyz';

// ─── Middleware Setup ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts for SPA
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // JSON body parsing with generous limit
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag: true,
  lastModified: true
}));

// ─── Authentication Middleware ────────────────────────────────────────────────
/**
 * JWT Authentication Middleware
 * Extracts and verifies the JWT token from the Authorization header.
 * Attaches the user payload to the request object on success.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required', code: 'NO_TOKEN' });
  }

  try {
    // First check in-memory session store
    const session = sessions.findByToken(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid', code: 'INVALID_SESSION' });
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const tasksRoutes = require('./routes/tasks');
const voiceRoutes = require('./routes/voice');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');
const moodRoutes = require('./routes/mood');

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/notes', authenticateToken, notesRoutes);
app.use('/api/tasks', authenticateToken, tasksRoutes);
app.use('/api/voice', authenticateToken, voiceRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/mood', authenticateToken, moodRoutes);

// ─── Data Export/Import ───────────────────────────────────────────────────────
const { exportUserData, importUserData, users } = require('./data/database');

/**
 * GET /api/export - Export all user data as JSON
 */
app.get('/api/export', authenticateToken, (req, res) => {
  try {
    const data = exportUserData(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Export failed', message: err.message });
  }
});

/**
 * POST /api/import - Import user data from JSON
 */
app.post('/api/import', authenticateToken, (req, res) => {
  try {
    const result = importUserData(req.user.id, req.body.data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Import failed', message: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    name: 'Aria Productivity Suite',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
// All non-API routes serve the main index.html for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                    ✨ Aria v2.0.0 ✨                      ║
║          AI-Powered Productivity Suite                    ║
║──────────────────────────────────────────────────────────║
║  Server running on: http://0.0.0.0:${PORT.toString().padEnd(5)}               ║
║  Open your browser to start being productive!            ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
