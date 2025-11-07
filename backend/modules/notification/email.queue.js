const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');

class EmailQueue {
  constructor() {
    this.queue = new Queue('email-queue', {
      connection: redisConnection.client,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
      },
    });

    this.queue.on('error', (err) => console.error('[EmailQueue] Error:', err.message));
  }

  async addEmailVerification(user, otp) {
    return await this.queue.add('email-verification', { user, otp });
  }

  async addPasswordReset(user, token) {
    return await this.queue.add('password-reset', { user, token });
  }
}

let emailQueueInstance = null;
function getEmailQueue() {
  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue();
    console.log('Email Queue initialized');
  }
  return emailQueueInstance;
}

module.exports = { getEmailQueue };
