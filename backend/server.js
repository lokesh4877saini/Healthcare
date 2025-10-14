const app = require('./app');
require('dotenv').config({ path: "./config/config.env" })
const connection = require('./config/db');
const { redisConnection } = require('./config/redis')
const startEmailWorker = require('./workers/emailWorker'); // worker
const PORT = process.env.PORT || 4001;
// Connect to database
connection();

// Initialize Redis client with current environment variables
redisConnection.setupClient();

// Connect to Redis and then start worker
async function initializeServer() {
  try {
    if (!redisConnection.client) {
      console.log('Redis not configured - running without email queue');
      return;
    }
    await redisConnection.connect();
    console.log('Redis connected successfully');
    
    // Start worker after short delay to ensure Redis is ready
    setTimeout(() => {
      const worker = startEmailWorker();
      if (worker) {
        console.log('Email Worker started successfully');
      } else {
        console.log(' Failed to start Email Worker');
      }
    }, 1000);
    
  } catch (error) {
    console.error(' Failed to initialize Redis:', error.message);
  }
}

initializeServer();
  
app.get('/', (req, res) => {
    res.send("okey");
})
app.get('/rahul', (req, res) => {
    res.send(
        `
        <!DOCTYPE html>
       <html lang="en">
       <head>
           <meta charset="UTF-8">
           <meta http-equiv="X-UA-Compatible" content="IE=edge">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Document</title>
       </head>
       <body>
           <h1>Hello Rahul ky hal chal</h1>
       </body>
       </html>
  `
    );
})
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running on http://0.0.0.0:${PORT}`);
//   });

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// suppose config.env we wrongly type data connection string then we caught error and our server will down 
// it is called unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error : ${err}`);
    console.log('Error:', err);
    console.log('Error message:', err.message);
    console.log('Error stack:', err.stack);
    console.log("Shutting down the server due to unhandled Promise Rejection")
    server.close(() => {
        process.exit(1);
    });
})