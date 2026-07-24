/**
 * Aria Dashboard Routes
 * 
 * Provides aggregated analytics and statistics for the main dashboard view.
 * Includes productivity metrics, activity charts, and smart insights.
 */

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../data/database');

/**
 * GET /api/dashboard/stats
 * Returns comprehensive dashboard statistics including:
 * - Overview counts (notes, tasks, voice recordings)
 * - Weekly activity data for charts
 * - Recent activity timeline
 * - Priority and category breakdowns
 * - Productivity streaks
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getDashboardStats(req.user.id);
    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats', message: err.message });
  }
});

/**
 * GET /api/dashboard/insights
 * Generates AI-powered productivity insights based on user data.
 * These are simulated insights that demonstrate the kind of analysis
 * a real AI system would provide.
 */
router.get('/insights', (req, res) => {
  try {
    const db = require('../data/database');
    const userNotes = Object.values(db.notes).filter(n => n.userId === req.user.id && !n.isTrashed);
    const userTasks = Object.values(db.tasks).filter(t => t.userId === req.user.id);
    const voiceNotes = Object.values(db.voiceRecordings).filter(r => r.userId === req.user.id);
    const userMoods = Object.values(db.moods).filter(m => m.userId === req.user.id);
    const user = db.users.findById(req.user.id);

    // Generate smart insights based on actual data patterns
    const insights = [];

    // Task completion insight
    const doneTasks = userTasks.filter(t => t.status === 'done');
    const overdueTasks = userTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
    if (userTasks.length > 0) {
      const rate = Math.round((doneTasks.length / userTasks.length) * 100);
      insights.push({
        type: rate > 70 ? 'achievement' : rate > 40 ? 'info' : 'warning',
        icon: rate > 70 ? '🏆' : rate > 40 ? '📊' : '⚠️',
        title: rate > 70 ? 'Excellent Progress!' : rate > 40 ? 'Steady Progress' : 'Room for Improvement',
        description: `You've completed ${rate}% of your tasks (${doneTasks.length}/${userTasks.length}).`,
        action: rate < 40 ? 'Try breaking tasks into smaller steps' : 'Keep up the great work!'
      });
    }

    // Overdue tasks alert
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        icon: '🔔',
        title: 'Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} that need attention.`,
        action: 'Review and reschedule'
      });
    }

    // Voice notes insight
    if (voiceNotes.length > 0) {
      const totalDuration = voiceNotes.reduce((sum, v) => sum + (v.duration || 0), 0);
      insights.push({
        type: 'info',
        icon: '🎙️',
        title: 'Voice Note Activity',
        description: `You've recorded ${voiceNotes.length} voice note${voiceNotes.length > 1 ? 's' : ''} totaling ${Math.round(totalDuration / 60)} minutes.`,
        action: 'Review transcriptions'
      });
    }

    // Note-taking streak
    if (userNotes.length > 0) {
      const recentNotes = userNotes.filter(n => {
        const daysSinceUpdate = (Date.now() - new Date(n.updatedAt).getTime()) / 86400000;
        return daysSinceUpdate <= 7;
      });
      if (recentNotes.length >= 5) {
        insights.push({
          type: 'achievement',
          icon: '📝',
          title: 'Consistent Note-taker',
          description: `${recentNotes.length} notes updated in the last 7 days. Consistency builds knowledge!`,
          action: 'Keep documenting'
        });
      }
    }

    // Priority management insight
    const highPriorityOpen = userTasks.filter(t => t.priority === 'urgent' && t.status !== 'done');
    if (highPriorityOpen.length > 0) {
      insights.push({
        type: 'warning',
        icon: '🔥',
        title: 'Urgent Items Need Attention',
        description: `You have ${highPriorityOpen.length} urgent task${highPriorityOpen.length > 1 ? 's' : ''} not yet started.`,
        action: 'Focus on urgent tasks first'
      });
    }

    // Mood-based insight
    if (userMoods.length >= 3) {
      const recentMoods = userMoods.slice(0, 7);
      const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
      insights.push({
        type: avgMood >= 4 ? 'achievement' : avgMood >= 3 ? 'info' : 'warning',
        icon: avgMood >= 4 ? '😊' : avgMood >= 3 ? '😐' : '😟',
        title: 'Mood Trend',
        description: `Your average mood over the last ${recentMoods.length} days is ${avgMood.toFixed(1)}/5.`,
        action: avgMood < 3 ? 'Consider taking breaks and self-care' : 'Great mindset!'
      });
    }

    // Productivity tip (always shown)
    const tips = [
      'Try the Pomodoro technique: 25 min focus, 5 min break',
      'Use voice notes for quick idea capture when typing is inconvenient',
      'Organize notes with tags and categories for easier retrieval',
      'Review and update your task priorities each morning',
      'The two-minute rule: if it takes <2 min, do it now',
      'Batch similar tasks together for better focus',
      'Use the Kanban board to visualize your workflow',
      'Set daily goals to maintain momentum',
      'Take regular breaks to maintain cognitive performance',
      'Review your weekly achievements every Friday'
    ];
    insights.push({
      type: 'tip',
      icon: '💡',
      title: 'Productivity Tip',
      description: tips[Math.floor(Math.random() * tips.length)],
      action: 'Try it today'
    });

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate insights', message: err.message });
  }
});

/**
 * GET /api/dashboard/activity
 * Returns the user's activity timeline for the calendar/heatmap view.
 */
router.get('/activity', (req, res) => {
  try {
    const db = require('../data/database');
    const days = parseInt(req.query.days) || 90;

    // Build activity heatmap data
    const activityMap = {};
    const startDate = new Date(Date.now() - days * 86400000);
    
    // Count notes created per day
    Object.values(db.notes).filter(n => n.userId === req.user.id).forEach(n => {
      const day = n.createdAt.split('T')[0];
      activityMap[day] = activityMap[day] || { date: day, notes: 0, tasks: 0, voiceNotes: 0, total: 0 };
      activityMap[day].notes++;
      activityMap[day].total++;
    });

    // Count tasks completed per day
    Object.values(db.tasks).filter(t => t.userId === req.user.id && t.completedAt).forEach(t => {
      const day = t.completedAt.split('T')[0];
      activityMap[day] = activityMap[day] || { date: day, notes: 0, tasks: 0, voiceNotes: 0, total: 0 };
      activityMap[day].tasks++;
      activityMap[day].total++;
    });

    // Count voice recordings per day
    Object.values(db.voiceRecordings).filter(r => r.userId === req.user.id).forEach(r => {
      const day = r.createdAt.split('T')[0];
      activityMap[day] = activityMap[day] || { date: day, notes: 0, tasks: 0, voiceNotes: 0, total: 0 };
      activityMap[day].voiceNotes++;
      activityMap[day].total++;
    });

    // Fill in missing days with zero activity
    const activity = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(startDate.getTime() + i * 86400000).toISOString().split('T')[0];
      if (activityMap[day]) {
        activity.push(activityMap[day]);
      } else {
        activity.push({ date: day, notes: 0, tasks: 0, voiceNotes: 0, total: 0 });
      }
    }

    res.json({ activity, totalDays: activity.filter(a => a.total > 0).length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity data', message: err.message });
  }
});

/**
 * GET /api/dashboard/focus
 * Manages focus/Pomodoro timer sessions.
 * Records focus sessions for tracking productive time.
 */
router.post('/focus/complete', (req, res) => {
  try {
    const { duration, type } = req.body; // type: 'focus', 'shortBreak', 'longBreak'
    const db = require('../data/database');
    const user = db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (type === 'focus' && duration) {
      user.stats.totalFocusMinutes = (user.stats.totalFocusMinutes || 0) + Math.round(duration / 60);
      db.users.update(req.user.id, { stats: user.stats });
    }

    res.json({
      message: `Focus session completed: ${Math.round(duration / 60)} minutes`,
      totalFocusMinutes: user.stats.totalFocusMinutes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save focus session', message: err.message });
  }
});

module.exports = router;
