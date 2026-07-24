/**
 * Aria Notes Routes
 * 
 * Complete CRUD API for notes with support for:
 * - Categories & tags
 * - Archiving & trash (soft delete)
 * - Pin/unpin
 * - Color coding
 * - Rich text content
 * - Search, filter, and sort
 */

const express = require('express');
const router = express.Router();
const { notes } = require('../data/database');

/**
 * GET /api/notes
 * Retrieves all notes for the authenticated user.
 * Supports query params: category, tag, search, archived, trashed
 */
router.get('/', (req, res) => {
  try {
    const options = {};
    if (req.query.category) options.category = req.query.category;
    if (req.query.tag) options.tag = req.query.tag;
    if (req.query.search) options.search = req.query.search;
    if (req.query.archived === 'true') options.archived = true;
    if (req.query.trashed === 'true') options.trashed = true;

    const userNotes = notes.findByUser(req.user.id, options);
    res.json({ notes: userNotes, count: userNotes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes', message: err.message });
  }
});

/**
 * GET /api/notes/:id
 * Retrieves a single note by its ID.
 */
router.get('/:id', (req, res) => {
  try {
    const note = notes.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch note', message: err.message });
  }
});

/**
 * POST /api/notes
 * Creates a new note with optional tags, category, color, and rich content.
 */
router.post('/', (req, res) => {
  try {
    const { title, content, tags, category, isPinned, color, richContent } = req.body;
    if (!title && !content) {
      return res.status(400).json({ error: 'Note must have a title or content' });
    }
    const note = notes.create({
      userId: req.user.id,
      title,
      content,
      tags,
      category,
      isPinned,
      color,
      richContent
    });
    res.status(201).json({ note, message: 'Note created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note', message: err.message });
  }
});

/**
 * PUT /api/notes/:id
 * Updates an existing note's fields.
 */
router.put('/:id', (req, res) => {
  try {
    const existing = notes.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const allowedFields = ['title', 'content', 'richContent', 'tags', 'category', 'isPinned', 'color', 'isArchived'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const updated = notes.update(req.params.id, updates);
    res.json({ note: updated, message: 'Note updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note', message: err.message });
  }
});

/**
 * DELETE /api/notes/:id
 * Soft-deletes a note (moves to trash).
 */
router.delete('/:id', (req, res) => {
  try {
    const existing = notes.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    notes.trash(req.params.id);
    res.json({ message: 'Note moved to trash' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note', message: err.message });
  }
});

/**
 * PUT /api/notes/:id/restore
 * Restores a note from the trash back to active notes.
 */
router.put('/:id/restore', (req, res) => {
  try {
    const existing = notes.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const restored = notes.restore(req.params.id);
    res.json({ note: restored, message: 'Note restored from trash' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore note', message: err.message });
  }
});

/**
 * DELETE /api/notes/:id/permanent
 * Permanently deletes a note from the database.
 */
router.delete('/:id/permanent', (req, res) => {
  try {
    const existing = notes.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    notes.deletePermanently(req.params.id);
    res.json({ message: 'Note permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to permanently delete note', message: err.message });
  }
});

/**
 * GET /api/notes/categories/all
 * Returns aggregate category data for the user's notes.
 */
router.get('/categories/all', (req, res) => {
  try {
    const categories = notes.getCategories(req.user.id);
    const tags = notes.getTags(req.user.id);
    res.json({ categories, tags });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', message: err.message });
  }
});

module.exports = router;
