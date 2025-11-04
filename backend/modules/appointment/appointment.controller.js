const catchAsyncError = require('core/middleware/catchAsyncError');
const AppointmentService = require('appointment/appointment.service');

// Book a new appointment
exports.bookAppointment = catchAsyncError(async (req, res, next) => {
  const { doctorId, date, startTime, endTime } = req.body;

  const { appointment, emailResult } = await AppointmentService.bookAppointment(
    doctorId,
    req.user._id,
    { date, startTime, endTime }
  );

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    emailQueued: emailResult.queued,
    emailFallback: emailResult.fallback,
    reminderScheduled: true, // Reminder
  });
});

// Get all appointments for a doctor
exports.getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  const appointments = await AppointmentService.getDoctorAppointments(req.user._id);
  res.status(200).json({ success: true, appointments });
});

// Get all appointments for a patient
exports.getPatientAppointments = catchAsyncError(async (req, res, next) => {
  const appointments = await AppointmentService.getPatientAppointments(req.user._id);
  res.status(200).json({ success: true, appointments });
});

// Delete a specific appointment
exports.deleteAppointment = catchAsyncError(async (req, res, next) => {
  const result = await AppointmentService.deleteAppointment(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: result.message });
});

// Reschedule appointment
exports.rescheduleAppointment = catchAsyncError(async (req, res, next) => {
  const { date, time, forceCreateSlot } = req.body;

  const result = await AppointmentService.rescheduleAppointment(
    req.params.id,
    req.user._id,
    { date, time, forceCreateSlot }
  );

  if (result.requiresConfirmation) {
    return res.status(409).json({
      success: false,
      requiresConfirmation: true,
      message: result.message
    });
  }

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// View details of a specific appointment
exports.viewAppointmentDetails = catchAsyncError(async (req, res, next) => {
  const appointment = await AppointmentService.getAppointmentDetails(req.params.id);
  res.json({ success: true, appointment });
});

// Add or update note for an appointment
exports.updateAppointmentNote = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  const result = await AppointmentService.updateAppointmentNote(req.params.id, { author, role, content });
  res.json({ success: true, message: result.message });
});

// Cancel appointment
exports.cancelAppointment = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  const result = await AppointmentService.cancelAppointment(req.params.id, { author, role, content });
  res.json({ success: true, message: result.message });
});

// Update appointment status
exports.updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const result = await AppointmentService.updateAppointmentStatus(req.params.id, status);
  res.json({ success: true, message: result.message });
});

// Delete all appointments
exports.deleteAllAppointments = catchAsyncError(async (req, res, next) => {
  const result = await AppointmentService.deleteAllAppointments();
  res.json({
    success: true,
    message: result.message,
    deletedCount: result.deletedCount
  });
});

