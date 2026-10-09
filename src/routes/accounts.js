const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM instagram_accounts
    ORDER BY createdAt DESC
  `).all();

  res.json(rows);
});

router.post('/', (req, res) => {
  const { userId, username, accessToken, refreshToken } = req.body;

  if (!userId || !username || !accessToken) {
    return res.status(400).json({ message: 'userId, username and accessToken are required.' });
  }

  const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!userExists) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO instagram_accounts (id, userId, username, accessToken, refreshToken, status, createdAt)
    VALUES (?, ?, ?, ?, ?, 'connected', ?)
  `).run(id, userId, username, accessToken, refreshToken || '', createdAt);

  res.status(201).json({ id, userId, username, status: 'connected', createdAt });
});

module.exports = router;
