require('module-alias/register');
require('dotenv').config({ path: './modules/core/config/config.env' });

const app = require('./app');
const connectDB = require('core/config/db');
const { redisConnection } = require('core/config/redis');
const { startAllWorkers } = require('core/jobs'); // centralized worker manager

const PORT = process.env.PORT || 4001;

// Connect MongoDB
connectDB();

// Initialize Redis client
redisConnection.setupClient();

let server;

async function initializeServer() {
  try {
    if (!redisConnection.client) {
      console.warn('Redis not configured - running without queues');
    } else {
      await redisConnection.connect();
      console.log(' Redis connected successfully');

      // Start all background workers (email, appointment, etc.)
      setTimeout(() => {
        startAllWorkers();
      }, 1000);
    }

    // Start Express server
    // server = app.listen(PORT, '0.0.0.0', () => {
    //   console.log(`Server running at http://localhost:${PORT}`);
    // });
    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(' Failed to initialize Redis or server:', error.message);
    process.exit(1);
  }
}

initializeServer();

// Simple health route
app.get('/', (req, res) => {
  res.send(' Healthcare backend app is running...');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  console.log('Shutting down server due to unhandled promise rejection');

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
