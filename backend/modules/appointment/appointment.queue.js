// appointment.queue.js
const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');

class AppointmentQueue {
  constructor() {
    if (!redisConnection.client || !redisConnection.isReady()) {
      throw new Error('Redis client not ready for appointment queue creation');
    }

    this.queue = new Queue('appointment-queue', {
      connection: redisConnection.client,
      defaultJobOptions: {
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 25 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        timeout: 45000,
      },
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.queue.on('error', (error) =>
      console.error('[AppointmentQueue] Error:', error.message)
    );
    this.queue.on('waiting', (jobId) =>
      console.log(`[AppointmentQueue] Job waiting: ${jobId}`)
    );
  }

  async addAppointmentConfirmation(doctor, patient, appointmentDetails) {
    const jobId = `confirm-${Date.now()}-${patient._id.toString().slice(-6)}`;
    const job = await this.queue.add(
      'appointment-confirmation',
      {
        doctor: { name: doctor.name, email: doctor.email },
        patient: { name: patient.name, email: patient.email },
        appointmentDetails,
      },
      { jobId, priority: 1 }
    );
    console.log(`[AppointmentQueue] Confirmation job added: ${job.id}`);
    return job;
  }

  async addAppointmentReminder(appointment, hoursBefore = 24) {
    const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
    const reminderTime = new Date(appointmentDate.getTime() - hoursBefore * 60 * 60 * 1000);
    const delay = Math.max(reminderTime.getTime() - Date.now(), 0);

    if (delay < 60 * 60 * 1000 || delay > 30 * 24 * 60 * 60 * 1000) {
      console.log(`[AppointmentQueue] Reminder not scheduled: invalid timing`);
      return null;
    }

    const job = await this.queue.add(
      'appointment-reminder',
      { appointment, hoursBefore },
      {
        jobId: `reminder-${appointment._id}`,
        delay,
        priority: 2,
      }
    );

    console.log(`[AppointmentQueue] Reminder job scheduled: ${job.id}`);
    return job;
  }

  async addAppointmentCancellation(appointment, cancelledBy, reason) {
    const jobId = `cancel-${Date.now()}-${appointment._id.toString().slice(-6)}`;
    const job = await this.queue.add(
      'appointment-cancellation',
      {
        appointment: {
          _id: appointment._id.toString(),
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patient: appointment.patient,
          doctor: appointment.doctor,
        },
        cancelledBy,
        reason: reason || 'Appointment cancelled by user',
      },
      { jobId, priority: 1 }
    );

    console.log(`[AppointmentQueue] Cancellation job added: ${job.id}`);
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
      total:
        waiting.length +
        active.length +
        completed.length +
        failed.length +
        delayed.length,
    };
  }
}

// Singleton instance
let appointmentQueueInstance = null;
function getAppointmentQueue() {
  if (!appointmentQueueInstance) {
    appointmentQueueInstance = new AppointmentQueue();
    console.log(' Appointment Queue initialized');
  }
  return appointmentQueueInstance;
}

module.exports = { getAppointmentQueue };
