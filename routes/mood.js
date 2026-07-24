/**
 * Aria Mood Tracking Routes
 * 
 * Enables daily mood logging with:
 * - Mood rating (1-5 scale)
 * - Energy level tracking
 * - Optional journal notes
 * - Streak calculation
 * - Historical data retrieval for charts
 */

const express = require('express');
const router = express.Router();
const { moods } = require('../data/database');

/**
 * POST /api/mood
 * Logs today's mood. If already logged today, updates the existing entry.
 * @param {number} mood - Mood rating 1-5
 * @param {number} energyLevel - Energy level 1-5
 * @param {string} note - Optional journal note
 */
router.post('/', (req, res) => {
  try {
    const { mood, energyLevel, note } = req.body;
    if (!mood || mood < 1 || mood > 5) {
      return res.status(400).json({ error: 'Mood rating is required (1-5)' });
    }
    const entry = moods.log({
      userId: req.user.id,
      mood: parseInt(mood),
      energyLevel: energyLevel !== undefined ? parseInt(energyLevel) : 3,
      note: note || ''
    });
    res.status(201).json({ mood: entry, message: 'Mood logged successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log mood', message: err.message });
  }
});

/**
 * GET /api/mood
 * Retrieves mood history for the specified number of days.
 * @param {number} days - Number of days of history (default: 30)
 */
router.get('/', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const history = moods.getByUser(req.user.id, days);
    const streak = moods.getStreak(req.user.id);
    
    // Calculate average mood and energy
    const avgMood = history.length > 0
      ? (history.reduce((sum, m) => sum + m.mood, 0) / history.length).toFixed(1)
      : 0;
    const avgEnergy = history.length > 0
      ? (history.reduce((sum, m) => sum + (m.energyLevel || 3), 0) / history.length).toFixed(1)
      : 0;

    res.json({
      history,
      streak,
      averageMood: parseFloat(avgMood),
      averageEnergy: parseFloat(avgEnergy),
      totalEntries: history.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mood history', message: err.message });
  }
});

/**
 * GET /api/mood/today
 * Returns today's mood entry if it exists.
 */
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const history = moods.getByUser(req.user.id, 1);
    const todayEntry = history.find(m => m.date === today);
    res.json({ mood: todayEntry || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today\'s mood', message: err.message });
  }
});

module.exports = router;
