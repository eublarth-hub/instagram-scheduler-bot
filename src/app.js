const express = require('express');
const cors = require('cors');
const path = require('path');
const authRouter = require('./routes/auth');
const accountsRouter = require('./routes/accounts');
const publicationsRouter = require('./routes/publications');

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', message: 'Instagram Scheduler Bot premium MVP is running.' });
});

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/publications', publicationsRouter);

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
