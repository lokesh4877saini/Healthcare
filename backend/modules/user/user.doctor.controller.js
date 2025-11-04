const catchAsyncErrors = require('core/middleware/catchAsyncError');
const doctorService = require('./user.doctor.service');

// Add Doctor Slots
exports.addDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const result = await doctorService.addDoctorSlots(req.user._id, req.body);
  res.status(200).json({ success: true, message: result.message });
});

// Get Doctor Slots
exports.getDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const slots = await doctorService.getDoctorSlots(req.user._id);
  res.status(200).json({ success: true, availableSlots: slots });
});

// Update Doctor Slots After Booking
exports.updateDoctorSlotsAfterBooking = catchAsyncErrors(async (req, res, next) => {
  const result = await doctorService.updateDoctorSlotsAfterBooking(req.body);
  res.status(200).json({ success: true, message: result.message });
});

// Get Doctors by Specialization
exports.getDoctorsBySpecialization = catchAsyncErrors(async (req, res, next) => {
  const { specialization } = req.query;
  const result = await doctorService.getDoctorsBySpecialization(specialization);
  res.status(200).json({ success: true, count: result.count, doctors: result.doctors });
});

// Delete Single Time Slot
exports.deleteSingleTimeSlot = catchAsyncErrors(async (req, res, next) => {
  const result = await doctorService.deleteSingleTimeSlot(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: result.message,
    availableSlots: result.availableSlots,
  });
});

// Delete All Slots for a Date
exports.deleteAllSlotsForDate = catchAsyncErrors(async (req, res, next) => {
  const result = await doctorService.deleteAllSlotsForDate(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: result.message,
    availableSlots: result.availableSlots,
  });
});

// Get Doctor by ID
exports.getDoctorById = catchAsyncErrors(async (req, res, next) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({ success: true, doctor });
});

// Get All Specializations
exports.getSpecializations = catchAsyncErrors(async (req, res, next) => {
  const specializations = await doctorService.getSpecializations();
  res.status(200).json({ success: true, specializations });
});

// Get All Doctors
exports.getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await doctorService.getAllDoctors();
  res.status(200).json({ success: true, doctors });
});
