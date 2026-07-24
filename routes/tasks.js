/**
 * Aria Tasks Routes
 * 
 * Full Kanban-style task management API with:
 * - CRUD operations
 * - Priority levels (low, medium, high, urgent)
 * - Status workflow (todo → in-progress → review → done)
 * - Due date tracking with overdue detection
 * - Kanban board data grouping
 * - Drag-and-drop reordering support
 */

const express = require('express');
const router = express.Router();
const { tasks } = require('../data/database');

/**
 * GET /api/tasks
 * Retrieves all tasks for the authenticated user.
 * Supports filtering by status, priority, category, and search.
 */
router.get('/', (req, res) => {
  try {
    const options = {};
    if (req.query.status) options.status = req.query.status;
    if (req.query.priority) options.priority = req.query.priority;
    if (req.query.category) options.category = req.query.category;
    if (req.query.search) options.search = req.query.search;

    const userTasks = tasks.findByUser(req.user.id, options);
    res.json({ tasks: userTasks, count: userTasks.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: err.message });
  }
});

/**
 * GET /api/tasks/kanban
 * Returns tasks grouped by their status for the Kanban board view.
 * Columns: todo, in-progress, review, done
 */
router.get('/kanban', (req, res) => {
  try {
    const kanbanData = tasks.getKanbanData(req.user.id);
    res.json(kanbanData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kanban data', message: err.message });
  }
});

/**
 * GET /api/tasks/:id
 * Retrieves a single task by ID.
 */
router.get('/:id', (req, res) => {
  try {
    const task = tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task', message: err.message });
  }
});

/**
 * POST /api/tasks
 * Creates a new task with priority, due date, category, and tags.
 */
router.post('/', (req, res) => {
  try {
    const { title, description, priority, dueDate, category, tags, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const task = tasks.create({
      userId: req.user.id,
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      category: category || 'general',
      tags: tags || [],
      status: status || 'todo' // Allow setting initial status
    });
    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', message: err.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Updates a task's fields including status transitions for the Kanban board.
 */
router.put('/:id', (req, res) => {
  try {
    const existing = tasks.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate', 'category', 'tags', 'order'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const updated = tasks.update(req.params.id, updates);
    res.json({ task: updated, message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', message: err.message });
  }
});

/**
 * PUT /api/tasks/:id/reorder
 * Updates task status and order index for Kanban drag-and-drop.
 * Receives: { status: 'todo'|'in-progress'|'review'|'done', order: number }
 */
router.put('/:id/reorder', (req, res) => {
  try {
    const existing = tasks.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { status, order } = req.body;
    const success = tasks.reorder(req.params.id, status || 'todo', order || 0);
    if (success) {
      res.json({ message: 'Task reordered' });
    } else {
      res.status(400).json({ error: 'Failed to reorder task' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to reorder task', message: err.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Permanently deletes a task.
 */
router.delete('/:id', (req, res) => {
  try {
    const existing = tasks.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    tasks.delete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', message: err.message });
  }
});

module.exports = router;
