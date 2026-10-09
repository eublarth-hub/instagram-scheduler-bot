const path = require('path');

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db'),
  APP_NAME: process.env.APP_NAME || 'Instagram Scheduler Bot',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret'
};
