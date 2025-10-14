const emailQueue = require('../queues/emailQueue');

class EmailService {
  static async sendAppointmentConfirmation(doctor, patient, appointmentDetails) {
    try {
      // Add email job to BullMQ queue instead of sending immediately
      await emailQueue.addAppointmentConfirmation(doctor, patient, appointmentDetails);
      console.log('Appointment confirmation queued');
      return { success: true, queued: true };
    } catch (error) {
      console.error('Failed to queue confirmation:', error);
      // Fallback: Send immediately if queue fails
      return await this.sendImmediateFallback(doctor, patient, appointmentDetails);
    }
  }

  static async scheduleAppointmentReminder(appointment, hoursBefore = 24) {
    try {
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
      await emailQueue.addAppointmentCancellation(appointment, cancelledBy, reason);
      console.log('Cancellation email queued');
      return { success: true, queued: true };
    } catch (error) {
      console.error('Failed to queue cancellation:', error);
      return { success: false, error: error.message };
    }
  }

  // Fallback method if Redis/Queue is down
  static async sendImmediateFallback(doctor, patient, appointmentDetails) {
    console.log('Using immediate email fallback...');
    const sendEmail = require('../utils/sendEmail');

    try {
      // Send emails immediately (old way)
      const doctorEmailOptions = {
        email: doctor.email,
        subject: `New Appointment Scheduled - ${appointmentDetails.date}`,
        template: 'doctor_appointment',
        name: doctor.name,
        doctorName: doctor.name,
        patientName: patient.name,
        date: appointmentDetails.date,
        time: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
        message: `You have a new appointment scheduled with ${patient.name}.`
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
        message: `Your appointment has been successfully booked.`
      };

      // Send emails in parallel
      await Promise.all([
        sendEmail(doctorEmailOptions),
        sendEmail(patientEmailOptions)
      ]);

      return { success: true, queued: false, fallback: true };
    } catch (fallbackError) {
      console.error('Fallback email also failed:', fallbackError);
      return { success: false, error: fallbackError.message };
    }
  }

  // Get queue status for monitoring
  static async getQueueStatus() {
    try {
      return await emailQueue.getStats();
    } catch (error) {
      console.error('Error getting queue status:', error);
      return null;
    }
  }
}

module.exports = EmailService;