const { getEmailQueue } = require('./email.queue');
const emailQueue = getEmailQueue();

const NotificationService = {
  async sendEmailVerification(user, otp) {
    return await emailQueue.addEmailVerification(user, otp);
  },

  async sendPasswordReset(user, token) {
    return await emailQueue.addPasswordReset(user, token);
  },
};

module.exports = NotificationService;
