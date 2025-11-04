module.exports = {
  model: require('./appointment.model'),
  controller: require('./appointment.controller'),
  service: require('./appointment.service'),
  routes: require('./appointment.routes'),
  queue: require('./appointment.queue'),
  worker: require('./appointment.worker'),
};
