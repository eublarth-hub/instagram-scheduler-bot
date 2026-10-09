const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { DB_PATH } = require('./config');

const dbDir = path.dirname(DB_PATH);
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const initDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      authToken TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS instagram_accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      username TEXT NOT NULL,
      accessToken TEXT NOT NULL,
      refreshToken TEXT,
      igUserId TEXT,
      pageId TEXT,
      accessTokenExpiry TEXT,
      status TEXT NOT NULL DEFAULT 'connected',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS publications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      accountId TEXT NOT NULL,
      mediaType TEXT NOT NULL DEFAULT 'image',
      mediaUrl TEXT,
      caption TEXT,
      scheduledAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      retryCount INTEGER NOT NULL DEFAULT 0,
      lastError TEXT,
      publishedAt TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (accountId) REFERENCES instagram_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS publication_history (
      id TEXT PRIMARY KEY,
      publicationId TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (publicationId) REFERENCES publications(id)
    );
  `);
};

initDatabase();

module.exports = { db, initDatabase };
