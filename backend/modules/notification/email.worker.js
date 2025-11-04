// modules/notification/email.worker.js
const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');

function startEmailWorker() {
  console.log(' Starting Email Worker...');

  if (!redisConnection.client) {
    console.warn(' Redis client not configured — cannot start Email Worker yet.');
    return null;
  }

  if (!redisConnection.isReady()) {
    console.warn(' Redis not ready — retrying in 2s...');
    setTimeout(() => startEmailWorker(), 2000);
    return null;
  }

  console.log(' Redis ready. Launching BullMQ Email Worker...');

  try {
    const worker = new Worker(
      'healthcare-email-queue',
      async (job) => {
        console.log(` Processing job: ${job.name} - ${job.id}`);

        try {
          switch (job.name) {
            // --- CASE 1: OTP Email Verification ---
            case 'email-verification': {
              const { user, otp } = job.data;
              await sendEmail({
                email: user.email,
                subject: 'Your Account Verification OTP',
                template: 'email_verification',
                name: user.name,
                otp,
                message: `Use the OTP below to verify your account. It expires in 10 minutes.`,
              });
              console.log(` Verification email sent to ${user.email}`);
              return { success: true, type: 'email-verification' };
            }

            // --- DEFAULT FALLBACK ---
            default:
              console.warn(` Unknown email job type: ${job.name}`);
              return { success: false, reason: 'Unknown job type' };
          }
        } catch (error) {
          console.error(` Email job failed (${job.id}):`, error.message);
          throw error; // BullMQ will handle retries
        }
      },
      {
        connection: redisConnection.client,
        concurrency: 2,
        lockDuration: 30000,
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
      }
    );

    // --- Event listeners ---
    worker.on('ready', () => console.log('Email Worker ready and listening for jobs'));
    worker.on('completed', (job, result) =>
      console.log(` Job ${job.id} completed successfully`, result)
    );
    worker.on('failed', (job, err) =>
      console.error(` Job ${job.id} failed:`, err.message)
    );
    worker.on('stalled', (jobId) =>
      console.warn(` Job stalled: ${jobId}`)
    );
    worker.on('error', (err) =>
      console.error(' Worker internal error:', err.message)
    );

    return worker;
  } catch (error) {
    console.error(' Failed to create Email Worker:', error.message);
    return null;
  }
}

module.exports = { startEmailWorker };
