const User = require('../models/user');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandler');
exports.addDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const { date, timeSlots } = req.body;

  if (!date || !timeSlots || !Array.isArray(timeSlots)) {
    return next(new ErrorHandler("Date and timeSlots are required", 400));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler("Only doctors can add slots", 403));
  }

  const existingSlot = user.availableSlots.find(slot => slot.date === date);

  if (existingSlot) {
    const duplicateTimes = timeSlots.filter(time => existingSlot.time.includes(time));

    if (duplicateTimes.length > 0) {
      return next(new ErrorHandler(
        `These time slots already exist for ${date}: ${duplicateTimes.join(', ')}`,
        400
      ));
    }

    existingSlot.time.push(...timeSlots);
  } else {
    user.availableSlots.push({ date, time: timeSlots });
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Slots updated successfully",
    availableSlots: user.availableSlots,
  });
});

exports.getDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  if (user.role !== 'doctor') {
    return next(new ErrorHandler('Only doctors can view slots', 403));
  }

  res.status(200).json({
    success: true,
    availableSlots: user.availableSlots || [],
  });
});
// Update Doctor's availableSlots after booking
exports.updateDoctorSlotsAfterBooking = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date, time } = req.body;

  if (!doctorId || !date || !time) {
    return next(new ErrorHandler("doctorId, date, and time are required", 400));
  }

  const doctor = await User.findOne({
    _id: doctorId,
    role: 'doctor',
    "availableSlots.date": date,
  });
  if (!doctor) {
    return next(new ErrorHandler("Doctor or slot not found", 404));
  }

  // Remove the specific time slot
  await User.updateOne(
    { _id: doctorId, "availableSlots.date": date },
    { $pull: { "availableSlots.$.time": time } }
  );

  res.status(200).json({
    success: true,
    message: "Slot removed from doctor's availability",
  });
});
exports.getDoctorsBySpecialization = catchAsyncErrors(async (req, res, next) => {
  const { specialization } = req.query;

  const query = {
    role: 'doctor',
  };

  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' }; // Case-insensitive search
  }

  const doctors = await User.find(query).select('-password');

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors,
  });
});
exports.deleteSingleTimeSlot = catchAsyncErrors(async (req, res, next) => {
  const { date, time } = req.body;

  if (!date || !time) {
    return next(new ErrorHandler('Date and time are required', 400));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler('Only doctors can update slots', 403));
  }

  const slot = user.availableSlots.find(slot => slot.date === date);

  if (!slot) {
    return next(new ErrorHandler('No slots found for this date', 404));
  }

  // Filter out the specific time
  slot.time = slot.time.filter(t => t !== time);

  // If no times left, remove the entire date entry
  if (slot.time.length === 0) {
    user.availableSlots = user.availableSlots.filter(s => s.date !== date);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `Time ${time} on ${date} deleted successfully.`,
    availableSlots: user.availableSlots
  });
});

exports.deleteAllSlotsForDate = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.body;

  if (!date) {
    return next(new ErrorHandler('Date is required', 400));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler('Only doctors can update slots', 403));
  }

  const existingSlot = user.availableSlots.find(slot => slot.date === date);

  if (!existingSlot) {
    return next(new ErrorHandler('No slots found for this date', 404));
  }

  // Remove the entire date entry
  user.availableSlots = user.availableSlots.filter(slot => slot.date !== date);

  await user.save();

  res.status(200).json({
    success: true,
    message: `All slots for ${date} deleted successfully.`,
    availableSlots: user.availableSlots
  });
});

exports.getDoctorById = catchAsyncErrors(async (req, res, next) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  res.status(200).json({
    success: true,
    doctor: {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots,
    },
  });
});

exports.getSpecializations = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: 'doctor' }, 'specialization');

  // Extract and normalize specializations
  const specializations = doctors
    .map(doc => doc.specialization.trim().toLowerCase())
    .filter(spec => spec); // remove empty strings

  // Deduplicate
  const uniqueSpecs = [...new Set(specializations)];

  res.status(200).json({
    success: true,
    specializations: uniqueSpecs,
  });
});
exports.getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: 'doctor' });
  if (!doctors) {
    return next(new ErrorHandler("Doctors not found", 400));
  }
  res.status(200).json({
    success: true,
    doctors
  });
});

