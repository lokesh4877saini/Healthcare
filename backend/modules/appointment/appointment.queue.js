const { Queue } = require('bullmq');
const { redisConnection } = require('core/config/redis');

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

    this.queue.on('error', (err) =>
      console.error('[AppointmentQueue] Error:', err.message)
    );
  }

  async addConfirmation(doctor, patient, appointment) {
    return await this.queue.add('appointment-confirmation', { doctor, patient, appointment });
  }

  async addReminder(doctor, patient, appointment, hoursBefore = 24) {
    const startTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const delay = Math.max(startTime - Date.now() - hoursBefore * 3600000, 0);
    return await this.queue.add('appointment-reminder', { doctor, patient, appointment }, { delay });
  }

  async addCancellation(doctor, patient, appointment, reason) {
    return await this.queue.add('appointment-cancellation', { doctor, patient, appointment, reason });
  }
}

let appointmentQueueInstance = null;
function getAppointmentQueue() {
  if (!appointmentQueueInstance) {
    appointmentQueueInstance = new AppointmentQueue();
    // console.log(' Appointment Queue initialized');
  }
  return appointmentQueueInstance;
}

module.exports = { getAppointmentQueue };
