/**
 * Aria Settings Routes
 * 
 * Manages user preferences and application settings including:
 * - Theme (light/dark/system)
 * - Language and locale
 * - Time and date formats
 * - Notification preferences
 * - Focus/Pomodoro timer durations
 * - Daily goals
 */

const express = require('express');
const router = express.Router();
const { settings } = require('../data/database');

/**
 * GET /api/settings
 * Retrieves the current user's application settings.
 */
router.get('/', (req, res) => {
  try {
    let userSettings = settings.get(req.user.id);
    // Return defaults if no settings exist yet
    if (!userSettings) {
      userSettings = {
        userId: req.user.id,
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
        dailyGoal: 4
      };
    }
    res.json({ settings: userSettings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
});

/**
 * PUT /api/settings
 * Updates user settings. Only provided fields will be updated.
 */
router.put('/', (req, res) => {
  try {
    const updated = settings.update(req.user.id, req.body);
    if (!updated) {
      return res.status(400).json({ error: 'Failed to update settings' });
    }
    res.json({ settings: updated, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', message: err.message });
  }
});

/**
 * PUT /api/settings/theme
 * Quick shortcut for toggling/updating the theme setting.
 */
router.put('/theme', (req, res) => {
  try {
    const { theme } = req.body;
    if (!['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ error: 'Theme must be light, dark, or system' });
    }
    const updated = settings.update(req.user.id, { theme });
    res.json({ settings: updated, message: `Theme changed to ${theme}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update theme', message: err.message });
  }
});

module.exports = router;
