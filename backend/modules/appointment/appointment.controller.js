const catchAsyncError = require('core/middleware/catchAsyncError');
const AppointmentService = require('appointment/appointment.service');
const NotificationService = require('notification/notification.service');

//Book a new appointm 
exports.bookAppointment = catchAsyncError(async (req, res, next) => {
  const { doctorId, date, startTime, endTime } = req.body;
  const patientId = req.user._id;
  await AppointmentService.bookAppointment(doctorId,patientId,{date,startTime,endTime});
  res.status(201).json({
    success: true,
    message: ' Appointment booked successfully.'
  });
});

//Get all appointments for a doctor
exports.getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  const appointments = await AppointmentService.getDoctorAppointments(req.user._id);
  res.status(200).json({ success: true, appointments });
});

//Get all appointments for a patient
exports.getPatientAppointments = catchAsyncError(async (req, res, next) => {
  const appointments = await AppointmentService.getPatientAppointments(req.user._id);
  res.status(200).json({ success: true, appointments });
});

//View appointment details
exports.viewAppointmentDetails = catchAsyncError(async (req, res, next) => {
  const appointment = await AppointmentService.getAppointmentDetails(req.params.id);
  res.status(200).json({ success: true, appointment });
});

//Reschedule appointment
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
      message: result.message,
    });
  }

  // Send updated appointment info (optional email)
  // const appointment = await AppointmentService.findAppointmentById(req.params.id);
  // NotificationService.sendAppointmentConfirmation(appointment.doctor, appointment.patient, appointment)
  //   .catch(err => console.error(' Failed to queue reschedule email:', err));

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

//@desc Cancel appointment
exports.cancelAppointment = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  // const appointment = await AppointmentService.findAppointmentById(req.params.id);

  const result = await AppointmentService.cancelAppointment(req.params.id, { author, role, content });

  // Queue cancellation email
  // NotificationService.sendAppointmentCancellation(appointment, author, content)
  //   .catch(err => console.error(' Failed to queue cancellation email:', err));

  res.status(200).json({ success: true, message: result.message });
});

//Add or update appointment not
exports.updateAppointmentNote = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  const result = await AppointmentService.updateAppointmentNote(req.params.id, { author, role, content });
  res.status(200).json({ success: true, message: result.message });
});

//Update appointment status
exports.updateAppointmentStatus = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const result = await AppointmentService.updateAppointmentStatus(req.params.id, status);
  res.status(200).json({ success: true, message: result.message });
});

// Delete a specific appointment
exports.deleteAppointment = catchAsyncError(async (req, res, next) => {
  const result = await AppointmentService.deleteAppointment(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: result.message });
});

// Delete all appointments (admin)
exports.deleteAllAppointments = catchAsyncError(async (req, res, next) => {
  const result = await AppointmentService.deleteAllAppointments();
  res.status(200).json({
    success: true,
    message: result.message,
    deletedCount: result.deletedCount,
  });
});
