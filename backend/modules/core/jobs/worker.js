require('module-alias/register');
require('dotenv').config({ path: './modules/core/config/config.env' });

const { redisConnection } = require('core/config/redis');
const { startAllWorkers } = require('./index');
const createLogger = require('core/logger/withContext');

const logger = createLogger('Worker');

(async () => {
  try {
    // Connect Redis
    await redisConnection.connect();
    logger.info('Redis connected successfully');

    // Start all workers
    startAllWorkers();
    logger.info('All background workers started');

    // Keep process alive for PM2
    process.stdin.resume();
  } catch (err) {
    logger.error('Worker failed:', err.message);
    process.exit(1);
  }
})();
