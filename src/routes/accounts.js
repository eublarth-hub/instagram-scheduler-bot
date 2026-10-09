const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();
  const token = crypto.randomBytes(32).toString('hex');

  db.prepare(`
    INSERT INTO users (id, email, password, authToken, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, normalizedEmail, hashedPassword, token, new Date().toISOString());

  return res.status(201).json({
    user: { id: userId, email: normalizedEmail },
    token
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('UPDATE users SET authToken = ? WHERE id = ?').run(token, user.id);

  return res.json({
    user: { id: user.id, email: user.email },
    token
  });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, email, createdAt FROM users WHERE id = ?').get(req.user.id);
  return res.json(user);
});

module.exports = router;
