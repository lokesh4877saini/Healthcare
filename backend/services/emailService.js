//getter instance
const { getEmailQueue } = require('../queues/emailQueue');

class EmailService {
  static async sendAppointmentConfirmation(doctor, patient, appointmentDetails) {
    try {
      const emailQueue = getEmailQueue();
      await emailQueue.addAppointmentConfirmation(doctor, patient, appointmentDetails);
      console.log('Appointment confirmation queued');
      return { success: true, queued: true };
    } catch (error) {
      console.error('Failed to queue confirmation:', error);
      return await this.sendImmediateFallback(doctor, patient, appointmentDetails);
    }
  }

  static async sendEmailVerification(user, otp) {
    try {
      const emailQueue = getEmailQueue();
      await emailQueue.addEmailVerification(user, otp);
      console.log('Verification OTP email queued');
      return { success: true, queued: true };
    } catch (error) {
      console.error('Failed to queue verification email:', error);
      return await this.sendImmediateVerificationFallback(user, otp);
    }
  }

  static async scheduleAppointmentReminder(appointment, hoursBefore = 24) {
    try {
      const emailQueue = getEmailQueue();
      const job = await emailQueue.addAppointmentReminder(appointment, hoursBefore);
      if (job) {
        console.log(`${hoursBefore}h reminder queued`);
        return { success: true, queued: true };
      }
      return { success: true, queued: false, reason: 'Appointment too soon' };
    } catch (error) {
      console.error('Failed to queue reminder:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendAppointmentCancellation(appointment, cancelledBy, reason) {
    try {
      const emailQueue = getEmailQueue();
      await emailQueue.addAppointmentCancellation(appointment, cancelledBy, reason);
      console.log('Cancellation email queued');
      return { success: true, queued: true };
    } catch (error) {
      console.error('Failed to queue cancellation:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendImmediateVerificationFallback(user, otp) {
    console.log('Using immediate fallback for verification OTP...');
    const sendEmail = require('../utils/sendEmail');
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Account Verification OTP',
        template: 'email_verification', // make sure template name matches file
        name: user.name,
        otp,
        message: `Use the OTP below to verify your account. It expires in 10 minutes.`,
      });
      return { success: true, queued: false, fallback: true };
    } catch (error) {
      console.error('Verification fallback failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendImmediateFallback(doctor, patient, appointmentDetails) {
    console.log('Using immediate email fallback...');
    const sendEmail = require('../utils/sendEmail');

    try {
      const doctorEmailOptions = {
        email: doctor.email,
        subject: `New Appointment Scheduled - ${appointmentDetails.date}`,
        template: 'doctor_appointment',
        name: doctor.name,
        doctorName: doctor.name,
        patientName: patient.name,
        date: appointmentDetails.date,
        time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
        message: `You have a new appointment scheduled with ${patient.name}.`,
      };

      const patientEmailOptions = {
        email: patient.email,
        subject: `Appointment Confirmation with Dr. ${doctor.name} on ${appointmentDetails.date}`,
        template: 'patient_confirmation',
        name: patient.name,
        doctorName: doctor.name,
        patientName: patient.name,
        date: appointmentDetails.date,
        time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
        message: `Your appointment has been successfully booked.`,
      };

      await Promise.all([sendEmail(doctorEmailOptions), sendEmail(patientEmailOptions)]);

      return { success: true, queued: false, fallback: true };
    } catch (fallbackError) {
      console.error('Fallback email also failed:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }

  static async getQueueStatus() {
    try {
      const emailQueue = getEmailQueue();
      return await emailQueue.getStats();
    } catch (error) {
      console.error('Error getting queue status:', error);
      return null;
    }
  }
}

module.exports = EmailService;