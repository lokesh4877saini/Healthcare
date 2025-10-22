const app = require('./app');
require('dotenv').config({ path: "./config/config.env" });
const connection = require('./config/db');
const { redisConnection } = require('./config/redis');
const startEmailWorker = require('./workers/emailWorker'); // worker
const PORT = process.env.PORT || 4001;

// Connect to database
connection();

// Initialize Redis client with current environment variables
redisConnection.setupClient();

// Variable to hold server instance
let server;

// Connect to Redis and then start worker
async function initializeServer() {
  try {
    if (!redisConnection.client) {
      console.log('Redis not configured - running without email queue');
    } else {
      await redisConnection.connect();
      console.log('Redis connected successfully');

      // Start worker after short delay to ensure Redis is ready
      setTimeout(() => {
        const worker = startEmailWorker();
        if (worker) {
          console.log('Email Worker started successfully');
        } else {
          console.log('Failed to start Email Worker');
        }
      }, 1000);
    }

    // app.listen(PORT, '0.0.0.0', () => {
    //     console.log(`Server running on http://0.0.0.0:${PORT}`);
    //   });

    // Start Express server
    server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to initialize Redis or server:', error.message);
    process.exit(1);
  }
}

initializeServer();

// Test routes
app.get('/', (req, res) => {
  res.send("okey");
});



// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error(err.stack);
  console.log("Shutting down the server due to unhandled Promise Rejection");

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
