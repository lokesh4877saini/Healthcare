const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');

function startAppointmentWorker() {
  console.log('Starting Appointment Worker...');

  if (!redisConnection.client || !redisConnection.isReady()) {
    console.warn(' Redis not ready — Appointment Worker not started.');
    return null;
  }

  const worker = new Worker(
    'appointment-queue',
    async (job) => {
      // console.log(`Processing appointment job: ${job.name}`);

      const { doctor, patient, appointment, reason } = job.data;

      switch (job.name) {
        case 'appointment-confirmation':
          await sendEmail({
            email: patient.email,
            subject: `Appointment Confirmed with Dr. ${doctor.name}`,
            template: 'patient_confirmation',
            doctorName: doctor.name,
            patientName: patient.name,
            date: appointment.date,
            time: `${appointment.startTime} - ${appointment.endTime}`,
            message: 'Your appointment has been confirmed.',
          });
          break;

        case 'appointment-reminder':
          await sendEmail({
            email: patient.email,
            subject: `Reminder: Appointment with Dr. ${doctor.name}`,
            template: 'appointment_reminder',
            doctorName: doctor.name,
            patientName: patient.name,
            date: appointment.date,
            time: `${appointment.startTime} - ${appointment.endTime}`,
            message: 'This is a reminder for your upcoming appointment.',
          });
          break;

        case 'appointment-cancellation':
          await sendEmail({
            email: patient.email,
            subject: 'Appointment Cancelled',
            message: `
              <p>Your appointment with Dr. ${doctor.name} on ${appointment.date} has been cancelled.</p>
              <p><b>Reason:</b> ${reason}</p>
            `,
          });
          break;

        default:
          console.warn(` Unknown job type: ${job.name}`);
      }
    },
    {
      connection: redisConnection.client,
      concurrency: 3,
    }
  );

  worker.on('ready', () => console.log(' Appointment Worker ready.'));
  worker.on('failed', (job, err) =>
    console.error(` Appointment job failed (${job.id}):`, err.message)
  );

  return worker;
}

module.exports = { startAppointmentWorker };
