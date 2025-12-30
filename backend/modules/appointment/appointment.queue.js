const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');
const createLogger = require('core/logger/withContext');

const logger = createLogger('Appointment-Queue');

class AppointmentQueue {
  constructor() {
    this.queue = new Queue('appointment-queue', {
      connection: redisConnection.client,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
      },
    });

    // Listen for connection or job-level errors
    this.queue.on('error', (err) => {
      logger.error('Queue error occurred', { message: err.message, stack: err.stack });
    });

    logger.info('Appointment Queue instance created and connected to Redis.');
  }

  /** Add appointment confirmation job */
  async addConfirmation(doctor, patient, appointment) {
    logger.info('Adding confirmation job', {
      doctorId: doctor._id,
      patientId: patient._id,
      appointmentId: appointment._id,
    });

    const job = await this.queue.add('appointment-confirmation', { doctor, patient, appointment });

    logger.info('Confirmation job queued successfully', { jobId: job.id });
    return job;
  }

  /** Add appointment reminder job */
  async addReminder(doctor, patient, appointment, hoursBefore = 24) {
    const startTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const delay = Math.max(startTime - Date.now() - hoursBefore * 3600000, 0);

    logger.info('Adding reminder job', {
      doctorId: doctor._id,
      patientId: patient._id,
      appointmentDate: appointment.date,
      delayMs: delay,
    });

    const job = await this.queue.add(
      'appointment-reminder',
      { doctor, patient, appointment },
      { delay }
    );

    logger.info('Reminder job queued successfully', { jobId: job.id });
    return job;
  }

  /** Add appointment cancellation job */
  async addCancellation(doctor, patient, appointment, reason) {
    logger.info('Adding cancellation job', {
      doctorId: doctor._id,
      patientId: patient._id,
      appointmentId: appointment._id,
      reason,
    });

    const job = await this.queue.add('appointment-cancellation', {
      doctor,
      patient,
      appointment,
      reason,
    });

    logger.info('Cancellation job queued successfully', { jobId: job.id });
    return job;
  }
}

let appointmentQueueInstance = null;

/** Singleton getter */
function getAppointmentQueue() {
  if (!appointmentQueueInstance) {
    appointmentQueueInstance = new AppointmentQueue();
    logger.info('Appointment Queue initialized successfully');
  }
  return appointmentQueueInstance;
}

module.exports = { getAppointmentQueue };
