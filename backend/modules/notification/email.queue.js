const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const createLogger = require('core/logger/withContext');

const logger = createLogger('Email-Queue');

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

    // Centralized error logging
    this.queue.on('error', (err) => {
      logger.error('Queue error occurred', { message: err.message, stack: err.stack });
    });

    logger.info('Email Queue instance created and connected to Redis.');
  }

  /** Add email verification job */
  async addEmailVerification(user, otp) {
    logger.info('Adding email verification job', {
      userId: user._id,
      email: user.email,
    });

    const job = await this.queue.add('email-verification', { user, otp });

    logger.info('Email verification job queued successfully', { jobId: job.id });
    return job;
  }

  /** Add password reset email job */
  async addPasswordReset(user, token) {
    logger.info('Adding password reset email job', {
      userId: user._id,
      email: user.email,
    });

    const job = await this.queue.add('password-reset', { user, token });

    logger.info('Password reset job queued successfully', { jobId: job.id });
    return job;
  }
}

let emailQueueInstance = null;

/** Singleton instance getter */
function getEmailQueue() {
  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue();
    logger.info('Email Queue initialized successfully');
  }
  return emailQueueInstance;
}

module.exports = { getEmailQueue };
