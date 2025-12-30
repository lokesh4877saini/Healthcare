const catchAsyncError = require('core/middleware/catchAsyncError');
const AppointmentService = require('appointment/appointment.service');
const createLogger = require('core/logger/withContext');
const logger = createLogger('AppointmentController');

// Book a new appointment
exports.bookAppointment = catchAsyncError(async (req, res, next) => {
  const { doctorId, date, startTime, endTime } = req.body;
  const patientId = req.user._id;

  logger.info(`Booking appointment`, { doctorId, patientId, date, startTime, endTime });

  await AppointmentService.bookAppointment(doctorId, patientId, { date, startTime, endTime });

  logger.info(`Appointment booked successfully`, { doctorId, patientId });
  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.'
  });
});

// Get all appointments for a doctor
exports.getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  const doctorId = req.user._id;
  logger.info(`Fetching doctor appointments`, { doctorId });

  const appointments = await AppointmentService.getDoctorAppointments(doctorId);

  logger.info(`Fetched ${appointments.length} appointments for doctor`, { doctorId });
  res.status(200).json({ success: true, appointments });
});

// Get all appointments for a patient
exports.getPatientAppointments = catchAsyncError(async (req, res, next) => {
  const patientId = req.user._id;
  logger.info(`Fetching patient appointments`, { patientId });

  const appointments = await AppointmentService.getPatientAppointments(patientId);

  logger.info(`Fetched ${appointments.length} appointments for patient`, { patientId });
  res.status(200).json({ success: true, appointments });
});

// View appointment details
exports.viewAppointmentDetails = catchAsyncError(async (req, res, next) => {
  const appointmentId = req.params.id;
  logger.info(`Fetching appointment details`, { appointmentId });

  const appointment = await AppointmentService.getAppointmentDetails(appointmentId);

  logger.info(`Appointment details fetched successfully`, { appointmentId });
  res.status(200).json({ success: true, appointment });
});

// Reschedule appointment
exports.rescheduleAppointment = catchAsyncError(async (req, res, next) => {
  const { date, time, forceCreateSlot } = req.body;
  const appointmentId = req.params.id;
  const userId = req.user._id;

  logger.info(`Rescheduling appointment`, { appointmentId, userId, date, time });

  const result = await AppointmentService.rescheduleAppointment(
    appointmentId,
    userId,
    { date, time, forceCreateSlot }
  );

  if (result.requiresConfirmation) {
    logger.warn(`Reschedule requires confirmation`, { appointmentId });
    return res.status(409).json({
      success: false,
      requiresConfirmation: true,
      message: result.message,
    });
  }

  logger.info(`Appointment rescheduled successfully`, { appointmentId });
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Cancel appointment
exports.cancelAppointment = catchAsyncError(async (req, res, next) => {
  const appointmentId = req.params.id;
  const { author, role, content } = req.body;

  logger.info(`Cancelling appointment`, { appointmentId, author, role });

  const result = await AppointmentService.cancelAppointment(appointmentId, { author, role, content });

  logger.info(`Appointment cancelled successfully`, { appointmentId });
  res.status(200).json({ success: true, message: result.message });
});

// Add or update appointment note
exports.updateAppointmentNote = catchAsyncError(async (req, res, next) => {
  const appointmentId = req.params.id;
  const { author, role, content } = req.body;

  logger.info(`Updating appointment note`, { appointmentId, author, role });

  const result = await AppointmentService.updateAppointmentNote(appointmentId, { author, role, content });

  logger.info(`Appointment note updated successfully`, { appointmentId });
  res.status(200).json({ success: true, message: result.message });
});

// Update appointment status
exports.updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
  const appointmentId = req.params.id;
  const { status } = req.body;

  logger.info(`Updating appointment status`, { appointmentId, status });

  const result = await AppointmentService.updateAppointmentStatus(appointmentId, status);

  logger.info(`Appointment status updated successfully`, { appointmentId, status });
  res.status(200).json({ success: true, message: result.message });
});

// Delete a specific appointment
exports.deleteAppointment = catchAsyncError(async (req, res, next) => {
  const appointmentId = req.params.id;
  const userId = req.user._id;

  logger.warn(`Deleting appointment`, { appointmentId, userId });

  const result = await AppointmentService.deleteAppointment(appointmentId, userId);

  logger.info(`Appointment deleted successfully`, { appointmentId });
  res.status(200).json({ success: true, message: result.message });
});

// Delete all appointments (admin)
exports.deleteAllAppointments = catchAsyncError(async (req, res, next) => {
  logger.warn(`Deleting all appointments (admin)`);

  const result = await AppointmentService.deleteAllAppointments();

  logger.info(`Deleted ${result.deletedCount} appointments`);
  res.status(200).json({
    success: true,
    message: result.message,
    deletedCount: result.deletedCount,
  });
});
