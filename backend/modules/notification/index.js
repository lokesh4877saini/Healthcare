module.exports = {
  queue: require('./email.queue'),
  worker: require('./email.worker'),
  service: require('./notification.service'),
};
