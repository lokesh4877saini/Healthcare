const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');

function startAppointmentWorker() {
  if (!redisConnection.client || !redisConnection.isReady()) {
    console.warn(' Redis not ready — Appointment Worker not started yet.');
    return null;
  }

  const worker = new Worker(
    'appointment-queue',
    async (job) => {
      const { name } = job;
      const data = job.data;

      switch (name) {
        case 'appointment-confirmation':
          console.log(`[Worker] Sending appointment confirmation email...`);
          await sendEmail({
            email: data.patient.email,
            subject: 'Appointment Confirmed',
            message: `
              <h3>Hello ${data.patient.name},</h3>
              <p>Your appointment with Dr. ${data.doctor.name} is confirmed.</p>
              <p><b>Date:</b> ${data.appointmentDetails.date}</p>
              <p><b>Time:</b> ${data.appointmentDetails.startTime} - ${data.appointmentDetails.endTime}</p>
            `,
          });
          break;

        case 'appointment-reminder':
          console.log(`[Worker] Sending appointment reminder email...`);
          await sendEmail({
            email: data.appointment.patient.email,
            subject: 'Appointment Reminder',
            message: `
              <p>Reminder: You have an appointment with Dr. ${data.appointment.doctor.name}</p>
              <p><b>Date:</b> ${data.appointment.date}</p>
              <p><b>Time:</b> ${data.appointment.startTime} - ${data.appointment.endTime}</p>
            `,
          });
          break;

        case 'appointment-cancellation':
          console.log(`[Worker] Sending appointment cancellation email...`);
          await sendEmail({
            email: data.appointment.patient.email,
            subject: 'Appointment Cancelled',
            message: `
              <p>Your appointment scheduled on ${data.appointment.date} has been cancelled.</p>
              <p><b>Reason:</b> ${data.reason}</p>
            `,
          });
          break;

        default:
          console.log(`[Worker] Unknown job type: ${name}`);
          break;
      }
    },
    {
      connection: redisConnection.client,
      concurrency: 2,
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 25 },
    }
  );

  // Event listeners
  worker.on('ready', () => console.log(' Appointment Worker is ready and listening for jobs'));
  worker.on('completed', (job) => console.log(` Job ${job.id} completed successfully`));
  worker.on('failed', (job, err) => console.error(` Job ${job.id} failed:`, err.message));
  worker.on('stalled', (jobId) => console.warn(` Job stalled: ${jobId}`));

  return worker;
}

module.exports = { startAppointmentWorker };
