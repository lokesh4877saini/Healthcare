const BookingService = require('./bookingService');
const EmailService = require('./emailService');
const User = require('../models/user');

class AppointmentService {
  static async bookAppointment(doctorId, patientId, appointmentData) {
    const { date, startTime, endTime } = appointmentData;

    // Validate and create booking
    const doctor = await BookingService.validateDoctor(doctorId);
    BookingService.validateTime(startTime, endTime);
    await BookingService.checkOverlappingAppointments(doctorId, date, startTime, endTime);
    
    const booking = await BookingService.createBooking(doctorId, patientId, date, startTime, endTime);

    // Get patient details and send emails
    const patient = await User.findById(patientId);
    await EmailService.sendAppointmentConfirmation(doctor, patient, {
      date,
      startTime,
      endTime
    });

    return booking;
  }
}

module.exports = AppointmentService;