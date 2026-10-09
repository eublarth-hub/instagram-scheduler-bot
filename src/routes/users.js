const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, createdAt FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT id, email, createdAt FROM users WHERE id = ?').all(req.user.id);
  res.json(rows);
});

module.exports = router;
