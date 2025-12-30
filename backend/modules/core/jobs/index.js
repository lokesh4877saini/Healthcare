const { startEmailWorker } = require('notification/email.worker');
const { startAppointmentWorker } = require('appointment/appointment.worker');
const createLogger = require('core/logger/withContext');

const logger = createLogger('jobs');

function startAllWorkers() {
  logger.info('Initializing all background workers...');

  startEmailWorker();
  startAppointmentWorker();

  logger.info('All workers initialized successfully');
}

module.exports = { startAllWorkers };
