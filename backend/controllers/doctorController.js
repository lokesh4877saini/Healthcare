const User = require('../models/user');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandler');
exports.addDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const { date, slots } = req.body;

  if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
    return next(new ErrorHandler("Date and slots are required", 400));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler("Only doctors can add slots", 403));
  }

  // Find existing slots for the date
  let existingSlot = user.availableSlots.find(slot => slot.date === date);

  // Initialize slots array if not present
  if (!existingSlot) {
    existingSlot = { date, slots: [] };
    user.availableSlots.push(existingSlot);
  }

  // Check for overlapping slots
  for (const newSlot of slots) {
    const [newStartHour, newStartMin] = newSlot.startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = newSlot.endTime.split(':').map(Number);
    const newStart = new Date(0, 0, 0, newStartHour, newStartMin);
    const newEnd = new Date(0, 0, 0, newEndHour, newEndMin);

    if (newEnd <= newStart) {
      return next(new ErrorHandler(`Invalid slot: endTime must be after startTime (${newSlot.startTime} - ${newSlot.endTime})`, 400));
    }

    const isOverlap = existingSlot.slots.some(existing => {
      const [existStartHour, existStartMin] = existing.startTime.split(':').map(Number);
      const [existEndHour, existEndMin] = existing.endTime.split(':').map(Number);
      const existStart = new Date(0, 0, 0, existStartHour, existStartMin);
      const existEnd = new Date(0, 0, 0, existEndHour, existEndMin);

      return newStart < existEnd && newEnd > existStart; // overlapping check
    });

    if (isOverlap) {
      return next(new ErrorHandler(`Slot overlaps with existing slot: ${newSlot.startTime} - ${newSlot.endTime}`, 400));
    }

    // Add valid new slot
    existingSlot.slots.push(newSlot);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Slots updated successfully",
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

