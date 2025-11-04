// modules/core/jobs/index.js
const { startEmailWorker } = require('notification/email.worker');
const { startAppointmentWorker } = require('appointment/appointment.worker');

function startAllWorkers() {
  console.log(' Initializing all background workers...');

  // Start workers safely
  const emailWorker = startEmailWorker?.();
  const appointmentWorker = startAppointmentWorker?.();

  console.log(' All workers initialized successfully');
  return { emailWorker, appointmentWorker };
}

module.exports = { startAllWorkers };
