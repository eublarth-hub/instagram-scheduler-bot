const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM instagram_accounts
    WHERE userId = ?
    ORDER BY createdAt DESC
  `).all(req.user.id);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { username, accessToken, refreshToken } = req.body;

  if (!username || !accessToken) {
    return res.status(400).json({ message: 'username and accessToken are required.' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO instagram_accounts (id, userId, username, accessToken, refreshToken, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 'connected', ?)
  `).run(id, req.user.id, username, accessToken, refreshToken || '', createdAt);

  res.status(201).json({ id, userId: req.user.id, username, status: 'connected', createdAt });
});

module.exports = router;
