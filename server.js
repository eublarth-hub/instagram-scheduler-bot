const app = require('./src/app');
const { startScheduler } = require('./src/services/schedulerService');
const { PORT } = require('./src/config');

const port = PORT || 3000;

app.listen(port, () => {
  console.log(`Instagram Scheduler Bot is running on http://localhost:${port}`);
  startScheduler();
});
