const catchAsyncErrors = require('core/middleware/catchAsyncError');
const doctorService = require('./user.doctor.service');
const createLogger = require('core/logger/withContext');

const logger = createLogger('DoctorController');

// Add Doctor Slots
exports.addDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  logger.info('Received request to add doctor slots', { doctorId: req.user._id });

  const result = await doctorService.addDoctorSlots(req.user._id, req.body);

  logger.info('Doctor slots added successfully', { doctorId: req.user._id, message: result.message });

  res.status(200).json({ success: true, message: result.message });
});

// Get Doctor Slots
exports.getDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  logger.info('Fetching doctor slots', { doctorId: req.user._id });

  const slots = await doctorService.getDoctorSlots(req.user._id);

  logger.info('Doctor slots fetched', { doctorId: req.user._id, slotCount: slots.length });

  res.status(200).json({ success: true, availableSlots: slots });
});

// Update Doctor Slots After Booking
exports.updateDoctorSlotsAfterBooking = catchAsyncErrors(async (req, res, next) => {
  logger.info('Updating doctor slots after booking', req.body);

  const result = await doctorService.updateDoctorSlotsAfterBooking(req.body);

  logger.info('Doctor slot updated successfully', { message: result.message });

  res.status(200).json({ success: true, message: result.message });
});

// Get Doctors by Specialization
exports.getDoctorsBySpecialization = catchAsyncErrors(async (req, res, next) => {
  const { specialization } = req.query;

  logger.info('Fetching doctors by specialization', { specialization });

  const result = await doctorService.getDoctorsBySpecialization(specialization);

  logger.info('Doctors fetched successfully', { count: result.count });

  res.status(200).json({
    success: true,
    count: result.count,
    doctors: result.doctors,
  });
});

// Delete Single Time Slot
exports.deleteSingleTimeSlot = catchAsyncErrors(async (req, res, next) => {
  logger.info('Deleting single time slot', { doctorId: req.user._id, ...req.body });

  const result = await doctorService.deleteSingleTimeSlot(req.user._id, req.body);

  logger.info('Single slot deleted successfully', { doctorId: req.user._id, message: result.message });

  res.status(200).json({
    success: true,
    message: result.message,
    availableSlots: result.availableSlots,
  });
});

// Delete All Slots for a Date
exports.deleteAllSlotsForDate = catchAsyncErrors(async (req, res, next) => {
  logger.info('Deleting all slots for a specific date', { doctorId: req.user._id, ...req.body });

  const result = await doctorService.deleteAllSlotsForDate(req.user._id, req.body);

  logger.info('All slots deleted successfully', { doctorId: req.user._id, message: result.message });

  res.status(200).json({
    success: true,
    message: result.message,
    availableSlots: result.availableSlots,
  });
});

// Get Doctor by ID
exports.getDoctorById = catchAsyncErrors(async (req, res, next) => {
  logger.info('Fetching doctor by ID', { doctorId: req.params.id });

  const doctor = await doctorService.getDoctorById(req.params.id);

  logger.info('Doctor fetched successfully', { doctorId: req.params.id });

  res.status(200).json({ success: true, doctor });
});

// Get All Specializations
exports.getSpecializations = catchAsyncErrors(async (req, res, next) => {
  logger.info('Fetching all specializations');

  const specializations = await doctorService.getSpecializations();

  logger.info('Specializations fetched successfully', { count: specializations.length });

  res.status(200).json({ success: true, specializations });
});

// Get All Doctors
exports.getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  logger.info('Fetching all doctors');

  const doctors = await doctorService.getAllDoctors();

  logger.info('All doctors fetched successfully', { count: doctors.length });

  res.status(200).json({ success: true, doctors });
});
