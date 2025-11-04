const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');

class EmailQueue {
  constructor() {
    if (!redisConnection.client || !redisConnection.isReady()) {
      throw new Error('Redis client not ready for queue creation');
    }

    this.queue = new Queue('healthcare-email-queue', {
      connection: redisConnection.client,
      defaultJobOptions: {
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        timeout: 45000,
      },
    });

    this.setupListeners();
  }

  setupListeners() {
    this.queue.on('error', (err) => console.error('Queue error:', err.message));
    this.queue.on('waiting', (jobId) => console.log(`Job waiting: ${jobId}`));
    this.queue.on('ioredis:close', () => console.log('Queue Redis connection closed'));
  }

  async addEmailVerification(user, otp) {
    const jobId = `verify-${Date.now()}-${user._id.toString().slice(-6)}`;
    try {
      const job = await this.queue.add(
        'email-verification',
        {
          user: { _id: user._id.toString(), name: user.name, email: user.email },
          otp,
        },
        { jobId, priority: 1 }
      );
      console.log(`Email verification job added: ${job.id}`);
      return job;
    } catch (error) {
      console.error('Failed to add email verification job:', error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaiting(),
        this.queue.getActive(),
        this.queue.getCompleted(),
        this.queue.getFailed(),
        this.queue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      console.error('Error getting queue stats:', error.message);
      return null;
    }
  }

  async close() {
    if (this.queue) {
      await this.queue.close();
      console.log('Email Queue closed');
    }
  }
}

// Singleton pattern
let emailQueueInstance = null;

function getEmailQueue() {
  if (!emailQueueInstance) {
    if (!redisConnection.isReady()) {
      throw new Error('Redis not ready. Cannot initialize Email Queue.');
    }
    emailQueueInstance = new EmailQueue();
    console.log('Email Queue initialized successfully');
  }
  return emailQueueInstance;
}

module.exports = { getEmailQueue };
