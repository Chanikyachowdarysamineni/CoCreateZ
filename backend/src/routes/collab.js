const express = require('express');
const router = express.Router();

// Comments & Annotations
router.post('/comment', (req, res) => {
  res.json({ message: 'Add comment - stub' });
});
router.get('/comments', (req, res) => {
  res.json({ comments: [] });
});

// Presence Awareness
router.get('/presence', (req, res) => {
  res.json({ users: ['Sarah', 'Mike', 'Emma'] });
});

// Activity Feed
router.get('/activity', (req, res) => {
  res.json({ feed: [] });
});

// Version Control
router.post('/version', (req, res) => {
  res.json({ message: 'Save version - stub' });
});
router.get('/versions', (req, res) => {
  res.json({ versions: [] });
});
router.post('/rollback', (req, res) => {
  res.json({ message: 'Rollback - stub' });
});

// Offline Support
router.get('/sync', (req, res) => {
  res.json({ message: 'Sync - stub' });
});

module.exports = router;
