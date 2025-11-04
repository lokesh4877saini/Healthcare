const { getEmailQueue } = require('notification/email.queue');
const sendEmail = require('core/utils/sendEmail');
const ErrorHandler = require('core/utils/ErrorHandler');

class NotificationService {
    constructor() {
        this.emailQueue = getEmailQueue();
    }
    async sendEmailVerification(user, otp) {
        try {
            await this.emailQueue.addEmailVerification(user, otp);
            return { success: true, message: 'Verification email queued successfully' };
        } catch (error) {
            console.error(' Failed to queue verification email:', error.message);
            throw new ErrorHandler('Failed to queue verification email', 500);
        }
    }
    async sendDirectEmail({ email, subject, template, data }) {
        try {
            await sendEmail({
                email,
                subject,
                template,
                ...data,
            });
            return { success: true, message: 'Email sent directly' };
        } catch (error) {
            console.error(' Direct email send failed:', error.message);
            throw new ErrorHandler('Direct email send failed', 500);
        }
    }
    async getQueueStats() {
        try {
            return await this.emailQueue.getStats();
        } catch (error) {
            console.error(' Failed to fetch email queue stats:', error.message);
            return null;
        }
    }
}

module.exports = new NotificationService();
