const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');

let emailQueueInstance = null;

class EmailQueue {
  constructor() {
    console.log(redisConnection,"REsisdf conect((((((((")
    if (!redisConnection.client) {
      throw new Error('Redis client not initialized');
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
    const job = await this.queue.add(
      'email-verification',
      { user: { _id: user._id.toString(), name: user.name, email: user.email }, otp },
      { jobId, priority: 1 }
    );
    console.log(`Email verification job added: ${job.id}`);
    return job;
  }

  async getStats() {
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
  }

  async close() {
    await this.queue.close();
    console.log('Email Queue closed');
  }
}

async function getEmailQueue() {
  // ✅ Wait until Redis is ready
  if (!redisConnection.isReady()) {
    console.warn('Redis not ready yet — waiting before initializing Email Queue...');
    await redisConnection.connect(); // ensures readiness
  }

  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue();
    console.log('✅ Email Queue initialized successfully');
  }

  return emailQueueInstance;
}

module.exports = { getEmailQueue };
