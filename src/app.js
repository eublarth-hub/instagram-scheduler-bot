const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const user = db.prepare('SELECT id, email, createdAt FROM users WHERE id = ?').get(req.user.id);
  return res.json(user);
});

module.exports = router;
