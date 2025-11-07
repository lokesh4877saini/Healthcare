const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');

function startEmailWorker() {
  console.log('Starting Email Worker...');

  if (!redisConnection.client || !redisConnection.isReady()) {
    console.warn('Redis not ready — cannot start Email Worker yet.');
    return null;
  }

  const worker = new Worker(
    'email-queue',
    async (job) => {
      console.log(`Processing email job: ${job.name} (${job.id})`);

      switch (job.name) {
        case 'email-verification': {
          const { user, otp } = job.data;
          await sendEmail({
            email: user.email,
            subject: 'Verify Your Account',
            template: 'email_verification',
            name: user.name,
            otp,
            message: 'Use this OTP to verify your account.',
          });
          break;
        }

        case 'password-reset': {
          const { user, token } = job.data;
          const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
          await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `Click here to reset your password: ${resetUrl}`,
          });
          break;
        }

        default:
          console.warn(`Unknown email job type: ${job.name}`);
      }
    },
    {
      connection: redisConnection.client,
      concurrency: 3,
    }
  );

  worker.on('ready', () => console.log(' Email Worker is ready.'));
  worker.on('failed', (job, err) =>
    console.error(` Email job failed (${job.id}):`, err.message)
  );

  return worker;
}

module.exports = { startEmailWorker };
