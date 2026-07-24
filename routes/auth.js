/**
 * Aria Authentication Routes
 * 
 * Handles user registration, login, logout, profile management,
 * and token-based session authentication using JWT.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users, sessions } = require('../data/database');

const JWT_SECRET = process.env.JWT_SECRET || 'aria-secret-key-change-in-production-abc123xyz';
const TOKEN_EXPIRY = '7d';

/**
 * POST /api/auth/register
 * Creates a new user account with encrypted password storage.
 * Validates input uniqueness and password strength.
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, underscores, hyphens)' });
    }

    // ── Check for existing user ───────────────────────────────────────────
    if (users.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    if (users.findByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // ── Create user ───────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = users.create({ username, email, passwordHash });

    // ── Generate JWT ──────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    sessions.create(user.id, token);

    // ── Response (never include passwordHash) ─────────────────────────────
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({
      message: 'Account created successfully! Welcome to Aria.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates existing users with email/password credentials.
 * Returns a JWT token for subsequent API calls.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ── Find user ─────────────────────────────────────────────────────────
    const user = users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ── Verify password ───────────────────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ── Generate JWT and record login ─────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    sessions.create(user.id, token);
    users.recordLogin(user.id);

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: 'Welcome back!',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * POST /api/auth/logout
 * Invalidates the current session token.
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    sessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Used for session validation and profile data loading.
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const session = sessions.findByToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired' });
  }
  const user = users.findById(session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

/**
 * PUT /api/auth/profile
 * Updates the current user's profile information.
 */
router.put('/profile', (req, res) => {
  // Uses the authenticateToken middleware from server.js
  const user = users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const updates = {};
  if (req.body.displayName) updates.displayName = req.body.displayName;
  if (req.body.bio !== undefined) updates.bio = req.body.bio;
  if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;
  
  const updated = users.update(req.user.id, updates);
  const { passwordHash: _, ...safeUser } = updated;
  res.json({ user: safeUser, message: 'Profile updated' });
});

/**
 * PUT /api/auth/password
 * Changes the user's password after verifying the current one.
 */
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  const user = users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  users.update(req.user.id, { passwordHash });
  // Invalidate all other sessions
  sessions.deleteUserSessions(req.user.id);
  res.json({ message: 'Password changed successfully. Please log in again.' });
});

module.exports = router;
