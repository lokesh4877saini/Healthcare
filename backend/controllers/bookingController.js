const catchAsyncError = require('../middleware/catchAsyncError');
const AppointmentService = require('../services/appointmentService');
const BookingService = require('../services/bookingService');

exports.bookAppointment = catchAsyncError(async (req, res, next) => {
  const { doctorId, date, startTime, endTime } = req.body;

  const { booking, emailResult } = await AppointmentService.bookAppointment(
    doctorId,
    req.user._id,
    { date, startTime, endTime }
  );

  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    emailQueued: emailResult.queued,
    emailFallback: emailResult.fallback,
    reminderScheduled: true,              //Reminder
  });
});

exports.getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  const bookings = await BookingService.getDoctorAppointments(req.user._id);
  res.status(200).json({ success: true, bookings });
});

exports.getPatientAppointments = catchAsyncError(async (req, res, next) => {
  const bookings = await BookingService.getPatientAppointments(req.user._id);
  res.status(200).json({ success: true, bookings });
});

exports.deleteBooking = catchAsyncError(async (req, res, next) => {
  const result = await BookingService.deleteBooking(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: result.message });
});

exports.rescheduleBooking = catchAsyncError(async (req, res, next) => {
  const { date, time, forceCreateSlot } = req.body;

  const result = await BookingService.rescheduleBooking(
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

exports.viewBookingDetails = catchAsyncError(async (req, res, next) => {
  const booking = await BookingService.getBookingDetails(req.params.id);
  res.json({ success: true, booking });
});

exports.updateNoteBooking = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  const result = await BookingService.updateBookingNote(req.params.id, { author, role, content });
  res.json({ success: true, message: result.message });
});

exports.cancelBooking = catchAsyncError(async (req, res, next) => {
  const { author, role, content } = req.body;
  const result = await BookingService.cancelBooking(req.params.id, { author, role, content });
  res.json({ success: true, message: result.message });
});

exports.updateStatusAppoitment = catchAsyncError(async (req, res, next) => {
  const { status } = req.body;
  const result = await BookingService.updateBookingStatus(req.params.id, status);
  res.json({ success: true, message: result.message });
});

exports.deleteAllBookings = catchAsyncError(async (req, res, next) => {
  const result = await BookingService.deleteAllBookings();
  res.json({ success: true, message: result.message, deletedCount: result.deletedCount });
});