const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { db } = require('../db');

const router = express.Router();
router.use(requireAuth);

router.get('/connect-url', (req, res) => {
  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/auth/instagram/callback';

  if (!appId) {
    return res.status(500).json({ message: 'META_APP_ID is missing.' });
  }

  const authUrl = new URL('https://www.facebook.com/dialog/oauth');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'instagram_basic,pages_show_list,pages_read_engagement,instagram_content_publish');
  authUrl.searchParams.set('response_type', 'code');

  return res.json({ authUrl: authUrl.toString() });
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Missing OAuth code.' });
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/auth/instagram/callback';

  if (!appId || !appSecret) {
    return res.status(500).json({ message: 'Missing Meta app configuration.' });
  }

  const tokenResponse = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(400).json({ message: 'Failed to exchange code for token', details: tokenData });
  }

  const meResponse = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name&access_token=${tokenData.access_token}`);
  const meData = await meResponse.json();

  const accountId = meData.id;

  return res.json({
    message: 'Instagram connected successfully.',
    accountId,
    tokenData,
    meData
  });
});

router.post('/connect', requireAuth, (req, res) => {
  const { username, accessToken, refreshToken, igUserId, pageId, accessTokenExpiry } = req.body;

  if (!username || !accessToken) {
    return res.status(400).json({ message: 'username and accessToken are required.' });
  }

  const existing = db.prepare('SELECT id FROM instagram_accounts WHERE userId = ? AND username = ?').get(req.user.id, username);
  if (existing) {
    return res.status(409).json({ message: 'Instagram account already connected.' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO instagram_accounts (id, userId, username, accessToken, refreshToken, igUserId, pageId, accessTokenExpiry, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'connected', ?)
  `).run(
    id,
    req.user.id,
    username,
    accessToken,
    refreshToken || '',
    igUserId || null,
    pageId || null,
    accessTokenExpiry || null,
    new Date().toISOString()
  );

  return res.status(201).json({ id, username, status: 'connected' });
});

module.exports = router;
