const logger = require('./index');

function withContext(context) {
  return {
    info: (msg, ...args) => logger.info(`[${context}] ${msg}`, ...args),
    warn: (msg, ...args) => logger.warn(`[${context}] ${msg}`, ...args),
    error: (msg, ...args) => logger.error(`[${context}] ${msg}`, ...args),
    debug: (msg, ...args) => logger.debug(`[${context}] ${msg}`, ...args),
  };
}

module.exports = withContext;
