const { db } = require('../db');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE authToken = ?').get(token);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  req.user = user;
  next();
}

module.exports = { requireAuth };
