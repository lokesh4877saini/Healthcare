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
      console.error('Failed to queue verification email:', error.message);
      return await this._sendImmediateVerificationFallback(user, otp);
    }
  }

  async sendAppointmentConfirmation(doctor, patient, appointmentDetails) {
    try {
      await this.emailQueue.addAppointmentConfirmation(doctor, patient, appointmentDetails);
      return { success: true, message: 'Appointment confirmation queued successfully' };
    } catch (error) {
      console.error('Failed to queue appointment confirmation:', error.message);
      return await this._sendImmediateAppointmentFallback(doctor, patient, appointmentDetails);
    }
  }

  async scheduleAppointmentReminder(appointment, hoursBefore = 24) {
    try {
      const job = await this.emailQueue.addAppointmentReminder(appointment, hoursBefore);
      if (job) {
        return { success: true, message: `${hoursBefore}h reminder queued successfully` };
      }
      return { success: true, message: 'Appointment too soon for reminder' };
    } catch (error) {
      console.error('Failed to queue appointment reminder:', error.message);
      throw new ErrorHandler('Failed to queue appointment reminder', 500);
    }
  }

  async sendAppointmentCancellation(appointment, cancelledBy, reason) {
    try {
      await this.emailQueue.addAppointmentCancellation(appointment, cancelledBy, reason);
      return { success: true, message: 'Appointment cancellation queued successfully' };
    } catch (error) {
      console.error('Failed to queue appointment cancellation:', error.message);
      return await this._sendImmediateCancellationFallback(appointment, cancelledBy, reason);
    }
  }

  async sendDirectEmail({ email, subject, template, data }) {
    try {
      await sendEmail({ email, subject, template, ...data });
      return { success: true, message: 'Email sent directly' };
    } catch (error) {
      console.error('Direct email send failed:', error.message);
      throw new ErrorHandler('Direct email send failed', 500);
    }
  }

  async getQueueStats() {
    try {
      return await this.emailQueue.getStats();
    } catch (error) {
      console.error('Failed to fetch email queue stats:', error.message);
      return null;
    }
  }

  async _sendImmediateVerificationFallback(user, otp) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Account Verification OTP',
        template: 'email_verification',
        name: user.name,
        otp,
        message: 'Use this OTP to verify your account. It expires in 10 minutes.',
      });
      return { success: true, queued: false, fallback: true };
    } catch (error) {
      console.error('Verification fallback failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async _sendImmediateAppointmentFallback(doctor, patient, appointmentDetails) {
    try {
      await Promise.all([
        sendEmail({
          email: doctor.email,
          subject: `New Appointment on ${appointmentDetails.date}`,
          template: 'doctor_appointment',
          name: doctor.name,
          doctorName: doctor.name,
          patientName: patient.name,
          date: appointmentDetails.date,
          time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
          message: `You have a new appointment scheduled with ${patient.name}.`,
        }),
        sendEmail({
          email: patient.email,
          subject: `Appointment Confirmation with Dr. ${doctor.name}`,
          template: 'patient_confirmation',
          name: patient.name,
          doctorName: doctor.name,
          patientName: patient.name,
          date: appointmentDetails.date,
          time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
          message: 'Your appointment has been successfully booked.',
        }),
      ]);
      return { success: true, queued: false, fallback: true };
    } catch (error) {
      console.error('Appointment fallback failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async _sendImmediateCancellationFallback(appointment, cancelledBy, reason) {
    try {
      const doctor = appointment.doctor;
      const patient = appointment.patient;

      await Promise.all([
        sendEmail({
          email: doctor.email,
          subject: `Appointment Cancelled - ${appointment.date}`,
          template: 'appointment_cancellation',
          name: doctor.name,
          doctorName: doctor.name,
          patientName: patient.name,
          reason,
          message: `The appointment scheduled with ${patient.name} has been cancelled by ${cancelledBy.name}.`,
        }),
        sendEmail({
          email: patient.email,
          subject: `Your Appointment Cancelled - ${appointment.date}`,
          template: 'appointment_cancellation',
          name: patient.name,
          doctorName: doctor.name,
          patientName: patient.name,
          reason,
          message: `Your appointment with Dr. ${doctor.name} has been cancelled by ${cancelledBy.name}.`,
        }),
      ]);
      return { success: true, queued: false, fallback: true };
    } catch (error) {
      console.error('Cancellation fallback failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
