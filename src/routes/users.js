const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM users
    ORDER BY createdAt DESC
  `).all();

  res.json(rows);
});

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password, createdAt)
    VALUES (?, ?, ?, ?)
  `).run(id, email, password, createdAt);

  res.status(201).json({ id, email, createdAt });
});

module.exports = router;
