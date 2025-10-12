const sendEmail = require('../utils/sendEmail');

class EmailService {
  static async sendAppointmentConfirmation(doctor, patient, appointmentDetails) {
    const { date, startTime, endTime } = appointmentDetails;

    // Doctor's email - uses doctor_appointment.ejs
    const doctorEmailOptions = {
      email: doctor.email,
      subject: `New Appointment Scheduled - ${date}`,
      template: 'doctor_appointment', // with underscore
      name: doctor.name,
      doctorName: doctor.name,
      patientName: patient.name,
      date: date,
      time: `${startTime} - ${endTime}`,
      message: `You have a new appointment scheduled with ${patient.name}.`
    };

    // Patient's email - uses patient_confirmation.ejs
    const patientEmailOptions = {
      email: patient.email,
      subject: `Appointment Confirmation with Dr. ${doctor.name} on ${date}`,
      template: 'patient_confirmation', // with underscore
      name: patient.name,
      doctorName: doctor.name,
      patientName: patient.name,
      date: date,
      time: `${startTime} - ${endTime}`,
      message: `Your appointment has been successfully booked.`
    };

//   static async sendAppointmentReminder(booking) {
//     const reminderOptions = {
//       email: booking.patient.email,
//       subject: `Appointment Reminder with Dr. ${booking.doctor.name}`,
//       name: booking.patient.name,
//       message: `This is a reminder for your upcoming appointment.`,
//       patientName: booking.patient.name,
//       doctorName: booking.doctor.name,
//       date: booking.date,
//       time: `${booking.startTime} - ${booking.endTime}`,
//       template: 'appointment_reminder' // Optional: create reminder template
//     };
    // Send emails in parallel
    await Promise.all([
      sendEmail(doctorEmailOptions),
      sendEmail(patientEmailOptions)
    ]);
  }
}

module.exports = EmailService;