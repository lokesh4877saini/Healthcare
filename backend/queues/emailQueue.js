const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

class EmailQueue {
  constructor() {
    if (!redisConnection.client || !redisConnection.isReady()) {
      throw new Error('Redis client not ready for queue creation');
    }

    this.queue = new Queue('healthcare-email-queue', {
      connection: redisConnection.client,
      defaultJobOptions: {
        removeOnComplete: { count: 50 }, // Keep only 50 completed jobs
        removeOnFail: { count: 25 }, // Keep only 25 failed jobs
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        timeout: 45000,
      },
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.queue.on('error', (error) => {
      console.error(' Queue error:', error.message);
    });

    this.queue.on('ioredis:close', () => {
      console.log('Queue Redis connection closed');
    });

    this.queue.on('waiting', (jobId) => {
      console.log(`Job waiting: ${jobId}`);
    });
  }

  async addAppointmentConfirmation(doctor, patient, appointmentDetails) {
    const jobId = `confirm-${Date.now()}-${patient._id.toString().slice(-6)}`;
    
    try {
      const job = await this.queue.add('appointment-confirmation', {
        doctor: {
          _id: doctor._id.toString(),
          name: doctor.name,
          email: doctor.email
        },
        patient: {
          _id: patient._id.toString(),
          name: patient.name,
          email: patient.email
        },
        appointmentDetails: {
          date: appointmentDetails.date,
          startTime: appointmentDetails.startTime,
          endTime: appointmentDetails.endTime
        }
      }, {
        jobId,
        priority: 1, // High priority for confirmations
      });

      console.log(` Confirmation job added: ${job.id}`);
      return job;

    } catch (error) {
      console.error(' Failed to add confirmation job:', error.message);
      throw error;
    }
  }

  async addAppointmentReminder(appointment, hoursBefore = 24) {
    try {
      const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
      const reminderTime = new Date(appointmentDate.getTime() - (hoursBefore * 60 * 60 * 1000));
      const delay = Math.max(reminderTime.getTime() - Date.now(), 0);

      // Don't schedule if appointment is in less than 1 hour or more than 30 days
      if (delay < (60 * 60 * 1000) || delay > (30 * 24 * 60 * 60 * 1000)) {
        console.log(` Reminder not scheduled - invalid timing: ${hoursBefore}h before`);
        return null;
      }

      const job = await this.queue.add('appointment-reminder', {
        appointment: {
          _id: appointment._id.toString(),
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patient: {
            name: appointment.patient?.name || 'Patient',
            email: appointment.patient?.email
          },
          doctor: {
            name: appointment.doctor?.name || 'Doctor',
            email: appointment.doctor?.email
          }
        },
        hoursBefore
      }, {
        jobId: `reminder-${appointment._id.toString()}`,
        delay: delay,
        priority: 2, // Medium priority for reminders
      });

      console.log(` Reminder job scheduled: ${job.id} for ${hoursBefore}h before`);
      return job;

    } catch (error) {
      console.error(' Failed to add reminder job:', error.message);
      throw error;
    }
  }

  async addAppointmentCancellation(appointment, cancelledBy, reason) {
    const jobId = `cancel-${Date.now()}-${appointment._id.toString().slice(-6)}`;
    
    try {
      const job = await this.queue.add('appointment-cancellation', {
        appointment: {
          _id: appointment._id.toString(),
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patient: {
            name: appointment.patient?.name || 'Patient',
            email: appointment.patient?.email
          },
          doctor: {
            name: appointment.doctor?.name || 'Doctor'
          }
        },
        cancelledBy,
        reason: reason || 'Appointment cancelled by user'
      }, {
        jobId,
        priority: 1, // High priority for cancellations
      });

      console.log(` Cancellation job added: ${job.id}`);
      return job;

    } catch (error) {
      console.error(' Failed to add cancellation job:', error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.queue.getWaiting(),
        this.queue.getActive(),
        this.queue.getCompleted(),
        this.queue.getFailed(),
        this.queue.getDelayed()
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length
      };
    } catch (error) {
      console.error(' Error getting queue stats:', error.message);
      return null;
    }
  }

  // Clean up method
  async close() {
    if (this.queue) {
      await this.queue.close();
      console.log(' Email Queue closed');
    }
  }
}

// Create queue instance with error handling
let emailQueueInstance = null;

try {
  if (redisConnection.isReady()) {
    emailQueueInstance = new EmailQueue();
    console.log('Email Queue initialized successfully');
  } else {
    console.log('Redis not ready, Email Queue will be created when Redis connects');
  }
} catch (error) {
  console.error('Failed to initialize Email Queue:', error.message);
}

module.exports = emailQueueInstance;