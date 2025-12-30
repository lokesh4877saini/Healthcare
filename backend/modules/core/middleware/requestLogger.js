const createLogger = require('core/logger/withContext');

const logger = createLogger('Request-Logger');
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

module.exports = requestLogger;
