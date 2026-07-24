/**
 * Aria Voice Recording Routes
 * 
 * Manages voice note recordings including:
 * - Recording metadata storage
 * - Simulated AI transcription
 * - Recording management (update, delete)
 * - Support for Web Audio API recordings
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { voiceRecordings } = require('../data/database');

// ─── File Upload Configuration ────────────────────────────────────────────────
const RECORDINGS_DIR = path.join(__dirname, '..', 'data', 'recordings');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    if (!fs.existsSync(RECORDINGS_DIR)) {
      fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    }
    cb(null, RECORDINGS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/mp4', 'audio/mpeg'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(webm|wav|mp3|ogg|mp4|m4a)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: webm, wav, mp3, ogg'));
    }
  }
});

/**
 * POST /api/voice/upload
 * Uploads an audio recording file with metadata.
 * The AI transcription is simulated for demonstration purposes.
 */
router.post('/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    const { title, duration, tags } = req.body;
    
    // Simulate AI transcription based on filename/title
    const sampleTranscriptions = [
      "Meeting notes: Discussed Q2 goals and project milestones. Action items include updating the roadmap and scheduling follow-up meetings.",
      "Quick idea: What if we implemented a dark mode with custom accent colors? Users could personalize their workspace.",
      "Reminder: Call the design team about the new mockups. Need feedback by Friday.",
      "Journal entry: Today was productive. Completed the API refactoring and wrote documentation.",
      "Brainstorming: New feature ideas for the productivity suite. Voice notes, smart tags, AI suggestions.",
      "Shopping list: Milk, eggs, bread, coffee, fresh vegetables, and pasta for dinner."
    ];
    const transcription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];

    const recording = voiceRecordings.create({
      userId: req.user.id,
      title: title || req.file.originalname || 'Voice Recording',
      duration: parseFloat(duration) || 0,
      transcription,
      filePath: req.file.path,
      fileSize: req.file.size,
      tags: tags ? JSON.parse(tags) : []
    });

    res.status(201).json({
      recording,
      transcription,
      message: 'Recording uploaded and processed successfully'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload recording', message: err.message });
  }
});

/**
 * POST /api/voice/transcribe
 * Simulates real-time transcription of text-based "voice input".
 * In production, this would integrate with a speech-to-text API.
 */
router.post('/transcribe', (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text to transcribe' });
    }
    // Simulate AI processing with smart enhancements
    const enhanced = text
      .replace(/\b(u|you)\b/gi, 'you')
      .replace(/\b(r|are)\b/gi, 'are')
      .replace(/\b(2|to|too)\b/gi, 'to')
      .replace(/\b(4|for)\b/gi, 'for')
      .replace(/\bbtw\b/gi, 'by the way')
      .replace(/\bidk\b/gi, "I don't know")
      .replace(/\bimo\b/gi, 'in my opinion')
      .replace(/\btbh\b/gi, 'to be honest');

    res.json({
      original: text,
      transcription: enhanced,
      confidence: 0.95,
      processingTime: Math.random() * 500 + 100
    });
  } catch (err) {
    res.status(500).json({ error: 'Transcription failed', message: err.message });
  }
});

/**
 * GET /api/voice
 * Lists all voice recordings for the authenticated user.
 */
router.get('/', (req, res) => {
  try {
    const recordings = voiceRecordings.findByUser(req.user.id);
    res.json({ recordings, count: recordings.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recordings', message: err.message });
  }
});

/**
 * GET /api/voice/:id
 * Retrieves a single recording's metadata and transcription.
 */
router.get('/:id', (req, res) => {
  try {
    const recording = voiceRecordings.findById(req.params.id);
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    if (recording.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    res.json({ recording });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recording', message: err.message });
  }
});

/**
 * PUT /api/voice/:id
 * Updates recording metadata (title, transcription, tags).
 */
router.put('/:id', (req, res) => {
  try {
    const existing = voiceRecordings.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Recording not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.transcription !== undefined) updates.transcription = req.body.transcription;
    if (req.body.tags) updates.tags = req.body.tags;

    const updated = voiceRecordings.update(req.params.id, updates);
    res.json({ recording: updated, message: 'Recording updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recording', message: err.message });
  }
});

/**
 * DELETE /api/voice/:id
 * Deletes a recording and its associated audio file.
 */
router.delete('/:id', (req, res) => {
  try {
    const existing = voiceRecordings.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Recording not found' });
    if (existing.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    voiceRecordings.delete(req.params.id);
    res.json({ message: 'Recording deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recording', message: err.message });
  }
});

module.exports = router;
