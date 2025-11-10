const { Worker } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const sendEmail = require('core/utils/sendEmail');
const createLogger = require('core/logger/withContext');

const logger = createLogger('AppointmentWorker');

async function startAppointmentWorker() {
  logger.info('Starting Appointment Worker...');

  // Ensure Redis is ready before starting the worker
  if (!redisConnection.client || !redisConnection.isReady()) {
    logger.warn('Redis not ready — cannot start Appointment Worker yet.');
    return null;
  }

  const worker = new Worker(
    'appointment-queue',
    async (job) => {
      const { doctor, patient, appointment, reason } = job.data;
      logger.info(`Processing appointment job`, {
        jobId: job.id,
        jobName: job.name,
        attemptsMade: job.attemptsMade,
      });

      try {
        switch (job.name) {
          /**  Appointment Confirmation */
          case 'appointment-confirmation': {
            logger.info('Sending appointment confirmation emails...', {
              doctorId: doctor._id,
              patientId: patient._id,
              appointmentId: appointment._id,
            });

            // Send confirmation to patient
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
            logger.info(' Confirmation email sent to patient', { email: patient.email });

            // Send confirmation to doctor
            await sendEmail({
              email: doctor.email,
              subject: `New Appointment with ${patient.name}`,
              template: 'doctor_appointment',
              doctorName: doctor.name,
              patientName: patient.name,
              date: appointment.date,
              time: `${appointment.startTime} - ${appointment.endTime}`,
              message: 'A new appointment has been booked with you.',
            });
            logger.info(' Confirmation email sent to doctor', { email: doctor.email });
            break;
          }

          /**  Appointment Reminder */
          case 'appointment-reminder': {
            logger.info('Sending appointment reminder...', {
              patientId: patient._id,
              appointmentId: appointment._id,
            });

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
            logger.info(' Reminder email sent successfully', { email: patient.email });
            break;
          }

          /**  Appointment Cancellation */
          case 'appointment-cancellation': {
            logger.info('Sending appointment cancellation...', {
              patientId: patient._id,
              appointmentId: appointment._id,
            });

            await sendEmail({
              email: patient.email,
              subject: 'Appointment Cancelled',
              message: `
                <p>Your appointment with Dr. ${doctor.name} on ${appointment.date} has been cancelled.</p>
                <p><b>Reason:</b> ${reason || 'Not specified'}</p>
              `,
            });

            logger.info(' Cancellation email sent successfully', { email: patient.email });
            break;
          }

          default:
            logger.warn('Unknown appointment job type received', { jobName: job.name });
        }
      } catch (error) {
        logger.error('Appointment job failed', {
          jobId: job.id,
          jobName: job.name,
          error: error.message,
          stack: error.stack,
        });
        throw error; // triggers retry according to BullMQ config
      }
    },
    {
      connection: redisConnection.client,
      concurrency: 3,
      lockDuration: 60000, // Prevent duplicate processing
    }
  );

  /** Worker Lifecycle Events */
  worker.on('ready', () => logger.info(' Appointment Worker is ready.'));
  worker.on('completed', (job) =>
    logger.info(' Appointment job completed successfully', {
      jobId: job.id,
      name: job.name,
    })
  );
  worker.on('failed', (job, err) =>
    logger.error(' Appointment job failed', {
      jobId: job?.id,
      name: job?.name,
      error: err.message,
    })
  );
  worker.on('stalled', (jobId) =>
    logger.warn('Appointment job stalled and will be retried', { jobId })
  );
  worker.on('error', (err) =>
    logger.error('Worker encountered a connection error', { error: err.message })
  );

  return worker;
}

module.exports = { startAppointmentWorker };
