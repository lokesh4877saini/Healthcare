const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');
const createLogger = require('core/logger/withContext');

const logger = createLogger('EmailWorker');

async function startEmailWorker() {
  logger.info('Starting Email Worker...');

  // Ensure Redis is ready
  if (!redisConnection.client || !redisConnection.isReady()) {
    logger.warn('Redis not ready — cannot start Email Worker yet.');
    return null;
  }

  // Create BullMQ worker instance
  const worker = new Worker(
    'email-queue',
    async (job) => {
      logger.info(`Processing job: ${job.name}`, {
        jobId: job.id,
        attemptsMade: job.attemptsMade,
      });

      try {
        switch (job.name) {
          case 'email-verification': {
            const { user, otp } = job.data;

            logger.info('Sending email verification...', {
              userId: user._id,
              email: user.email,
            });

            await sendEmail({
              email: user.email,
              subject: 'Verify Your Account',
              template: 'email_verification',
              name: user.name,
              otp,
              message: 'Use this OTP to verify your account.',
            });

            logger.info('Email verification sent successfully.', {
              userId: user._id,
              email: user.email,
            });
            break;
          }

          case 'password-reset': {
            const { user, token } = job.data;

            logger.info('Sending password reset email...', {
              userId: user._id,
              email: user.email,
            });

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
            await sendEmail({
              email: user.email,
              subject: 'Password Reset Request',
              message: `Click here to reset your password: ${resetUrl}`,
            });

            logger.info('Password reset email sent successfully.', {
              userId: user._id,
              email: user.email,
            });
            break;
          }

          default:
            logger.warn('Unknown email job type received.', { jobName: job.name });
        }
      } catch (error) {
        logger.error('Email job processing failed', {
          jobId: job.id,
          jobName: job.name,
          error: error.message,
          stack: error.stack,
        });
        throw error; // let BullMQ handle retries
      }
    },
    {
      connection: redisConnection.client,
      concurrency: 3,
      lockDuration: 60000, // 1 min lock to prevent duplicate processing
    }
  );

  // Worker lifecycle events
  worker.on('ready', () => logger.info('logger.info Email Worker is ready.'));
  worker.on('completed', (job) =>
    logger.info('logger.info Email job completed successfully', { jobId: job.id, name: job.name })
  );
  worker.on('failed', (job, err) =>
    logger.error(' Email job failed', {
      jobId: job?.id,
      name: job?.name,
      error: err.message,
    })
  );
  worker.on('stalled', (jobId) =>
    logger.warn('Job stalled and will be retried', { jobId })
  );
  worker.on('error', (err) =>
    logger.error('Worker encountered a connection error', { error: err.message })
  );

  return worker;
}

module.exports = { startEmailWorker };
