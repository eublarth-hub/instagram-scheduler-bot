const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { processDuePublications } = require('../services/schedulerService');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, a.username as accountUsername
    FROM publications p
    INNER JOIN instagram_accounts a ON a.id = p.accountId
    WHERE p.userId = ?
    ORDER BY p.scheduledAt DESC
  `).all(req.user.id);

  res.json(rows);
});

router.get('/summary', (req, res) => {
  const summary = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
      SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM publications
    WHERE userId = ?
  `).get(req.user.id);

  res.json(summary);
});

router.post('/', (req, res) => {
  const { accountId, mediaType, mediaUrl, caption, scheduledAt } = req.body;

  if (!accountId || !scheduledAt) {
    return res.status(400).json({ message: 'accountId and scheduledAt are required.' });
  }

  const accountExists = db.prepare('SELECT id FROM instagram_accounts WHERE id = ? AND userId = ?').get(accountId, req.user.id);
  if (!accountExists) {
    return res.status(404).json({ message: 'Instagram account not found.' });
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO publications (
      id, userId, accountId, mediaType, mediaUrl, caption, scheduledAt, status,
      retryCount, lastError, publishedAt, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', 0, NULL, NULL, ?, ?)
  `).run(
    id,
    req.user.id,
    accountId,
    mediaType || 'image',
    mediaUrl || '',
    caption || '',
    new Date(scheduledAt).toISOString(),
    now,
    now
  );

  res.status(201).json({
    id,
    userId: req.user.id,
    accountId,
    mediaType: mediaType || 'image',
    mediaUrl: mediaUrl || '',
    caption: caption || '',
    scheduledAt: new Date(scheduledAt).toISOString(),
    status: 'scheduled'
  });
});

router.post('/:id/publish', async (req, res) => {
  const publication = db.prepare('SELECT * FROM publications WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);

  if (!publication) {
    return res.status(404).json({ message: 'Publication not found.' });
  }

  const account = db.prepare('SELECT * FROM instagram_accounts WHERE id = ?').get(publication.accountId);

  try {
    const { publishToInstagram } = require('../services/instagramService');
    const result = await publishToInstagram(publication, account);

    db.prepare(`
      UPDATE publications
      SET status = 'published', publishedAt = ?, lastError = NULL, updatedAt = ?
      WHERE id = ?
    `).run(new Date().toISOString(), new Date().toISOString(), publication.id);

    db.prepare(`
      INSERT INTO publication_history (id, publicationId, status, message, createdAt)
      VALUES (?, ?, 'published', ?, ?)
    `).run(uuidv4(), publication.id, result.message || 'Manual publication succeeded.', new Date().toISOString());

    res.json({ message: 'Publication sent successfully.', publicationId: publication.id });
  } catch (error) {
    db.prepare(`
      UPDATE publications
      SET status = 'failed', lastError = ?, updatedAt = ?
      WHERE id = ?
    `).run(error.message, new Date().toISOString(), publication.id);

    db.prepare(`
      INSERT INTO publication_history (id, publicationId, status, message, createdAt)
      VALUES (?, ?, 'failed', ?, ?)
    `).run(uuidv4(), publication.id, error.message, new Date().toISOString());

    res.status(500).json({ message: error.message });
  }
});

router.post('/run-now', async (req, res) => {
  try {
    await processDuePublications();
    res.json({ message: 'Scheduler ran successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
