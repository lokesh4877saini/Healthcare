const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const sendEmail = require('../utils/sendEmail');

function startEmailWorker() {
  console.log('Starting Email Worker...');

  // Enhanced Redis connection check
  if (!redisConnection.client) {
    console.log(' Redis client not configured - cannot start worker');
    return null;
  }

  if (!redisConnection.isReady()) {
    console.log(` Redis status: ${redisConnection.getStatus()} - waiting 2 seconds...`);
    setTimeout(() => startEmailWorker(), 2000);
    return null;
  }

  console.log(' Redis is ready, creating BullMQ worker...');

  try {
    const worker = new Worker('healthcare-email-queue', async (job) => {
      console.log(` Processing: ${job.name} - ${job.id}`);

      try {
        const { doctor, patient, appointmentDetails } = job.data;

        // Send emails in parallel with error handling for each
        const [doctorResult, patientResult] = await Promise.allSettled([
          sendEmail({
            email: doctor.email,
            subject: `New Appointment - ${appointmentDetails.date}`,
            template: 'doctor_appointment',
            name: doctor.name,
            patientName: patient.name,
            date: appointmentDetails.date,
            time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
            message: `You have a new appointment scheduled with ${patient.name}.`
          }),
          sendEmail({
            email: patient.email,
            subject: `Appointment Confirmed with Dr. ${doctor.name}`,
            template: 'patient_confirmation',
            name: patient.name,
            doctorName: doctor.name,
            date: appointmentDetails.date,
            time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
            message: `Your appointment has been successfully booked.`
          })
        ]);

        // Check if both emails were sent successfully
        const doctorSent = doctorResult.status === 'fulfilled' && doctorResult.value;
        const patientSent = patientResult.status === 'fulfilled' && patientResult.value;

        if (!doctorSent || !patientSent) {
          const errors = [];
          if (doctorResult.status === 'rejected') errors.push(`Doctor email: ${doctorResult.reason.message}`);
          if (patientResult.status === 'rejected') errors.push(`Patient email: ${patientResult.reason.message}`);
          throw new Error(`Partial email failure: ${errors.join(', ')}`);
        }

        console.log(` Emails sent successfully: ${job.id}`);
        return { 
          success: true, 
          doctorEmail: doctorSent, 
          patientEmail: patientSent 
        };

      } catch (error) {
        console.error(` Email job failed: ${job.id}`, error.message);
        throw error; // This will trigger BullMQ retry
      }
    }, {
      connection: redisConnection.client,
      concurrency: 1, // Reduced to 1 for stability with Upstash
      lockDuration: 30000, // 30 seconds lock
      removeOnComplete: { count: 50 }, // Keep only 50 completed jobs
      removeOnFail: { count: 25 }, // Keep only 25 failed jobs
    });

    // Event listeners with better logging
    worker.on('completed', (job, returnvalue) => {
      console.log(` Job completed: ${job.id}`, returnvalue);
    });

    worker.on('failed', (job, err) => {
      console.error(` Job failed: ${job.id}`, err.message);
      console.error('Failure details:', {
        jobName: job?.name,
        attemptsMade: job?.attemptsMade,
        failedReason: job?.failedReason
      });
    });

    worker.on('error', (err) => {
      console.error(' BullMQ Worker error:', err.message);
    });

    worker.on('stalled', (jobId) => {
      console.log(` Job stalled: ${jobId}`);
    });

    worker.on('ready', () => {
      console.log(' BullMQ Worker is ready and listening for jobs');
    });

    worker.on('closed', () => {
      console.log(' BullMQ Worker closed');
    });

    console.log(' Email Worker started successfully');
    return worker;

  } catch (error) {
    console.error(' Failed to create BullMQ worker:', error.message);
    console.error('Worker creation error details:', error);
    return null;
  }
}

module.exports = startEmailWorker;