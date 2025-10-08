const User = require('../models/user');
const mongoose = require('mongoose');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandler');

exports.addDoctorSlots = catchAsyncErrors(async (req, res, next) => {
  const { date, startTime, endTime } = req.body;
  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler("Only doctors can add slots", 403));
  }

  // Find existing slots for THIS SPECIFIC DATE only
  const existingDateSlot = user.availableSlots.find(slot => slot.date === date);
  // Time validation
  const [newStartHour, newStartMin] = startTime.split(':').map(Number);
  const [newEndHour, newEndMin] = endTime.split(':').map(Number);

  if (newEndHour < newStartHour || (newEndHour === newStartHour && newEndMin <= newStartMin)) {
    return next(new ErrorHandler(`Invalid slot: endTime must be after startTime`, 400));
  }

  // OVERLAP CHECK - Only check slots on the SAME DATE
  if (existingDateSlot && existingDateSlot.slots.length > 0) {
    const hasOverlap = existingDateSlot.slots.some(existingSlot => {
      const [existStartHour, existStartMin] = existingSlot.startTime.split(':').map(Number);
      const [existEndHour, existEndMin] = existingSlot.endTime.split(':').map(Number);

      // Convert to minutes for easy comparison
      const newStartMinutes = newStartHour * 60 + newStartMin;
      const newEndMinutes = newEndHour * 60 + newEndMin;
      const existStartMinutes = existStartHour * 60 + existStartMin;
      const existEndMinutes = existEndHour * 60 + existEndMin;

      // Check for overlap
      const overlaps = (newStartMinutes < existEndMinutes && newEndMinutes > existStartMinutes);
      return overlaps;
    });

    if (hasOverlap) {
      return next(new ErrorHandler(`Slot overlaps with existing slot on ${date}`, 400));
    }
  }


  // Add the slot (using your existing MongoDB update code)
  const result = await User.updateOne(
    { _id: req.user._id, 'availableSlots.date': date },
    {
      $push: {
        'availableSlots.$.slots': {
          startTime: startTime,
          endTime: endTime,
          _id: new mongoose.Types.ObjectId()
        }
      }
    }
  );

  if (result.modifiedCount === 0) {
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          availableSlots: {
            date: date,
            slots: [{
              startTime: startTime,
              endTime: endTime,
              _id: new mongoose.Types.ObjectId()
            }]
          }
        }
      }
    );
  }

  res.status(200).json({
    success: true,
    message: "Slot added successfully"
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
  const { date, startTime, endTime } = req.body;
  if (!date || !startTime || !endTime) {
    return next(new ErrorHandler('Date, startTime and endTime are required', 400));
  }

  const user = await User.findById(req.user._id);

  if (user.role !== 'doctor') {
    return next(new ErrorHandler('Only doctors can update slots', 403));
  }
  // Find the date slot
  const dateSlot = user.availableSlots.find(slot => slot.date === date);
  if (!dateSlot) {
    return next(new ErrorHandler('No slots found for this date', 404));
  }

  // Find the slot by startTime and endTime
  const slotIndex = dateSlot.slots.findIndex(slot =>
    slot.startTime === startTime && slot.endTime === endTime
  );

  if (slotIndex === -1) {
    return next(new ErrorHandler(`Time slot ${startTime} - ${endTime} not found for ${date}`, 404));
  }

  // Remove the specific time slot
  dateSlot.slots.splice(slotIndex, 1);

  // If no slots left for this date, remove the entire date entry
  if (dateSlot.slots.length === 0) {
    user.availableSlots = user.availableSlots.filter(slot => slot.date !== date);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `Time slot ${startTime} - ${endTime} on ${date} deleted successfully.`
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
    message: `All slots for ${date} deleted successfully.`
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

