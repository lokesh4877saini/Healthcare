const Booking = require('../models/booking');
const User = require('../models/user');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');
exports.bookAppointment = catchAsyncError(async (req, res, next) => {
    const { doctorId, date, startTime, endTime } = req.body;

    // Check doctor existence
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
        return next(new ErrorHandler("Doctor not found", 404));
    }

    // validate startTime < endTime
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(0,0,0,sh,sm);
    const end = new Date(0,0,0,eh,em);
    if (end <= start) {
        return next(new ErrorHandler("endTime must be after startTime", 400));
    }

    // Prevent overlapping appointments
    const overlapping = await Booking.findOne({
        doctor: doctorId,
        date,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ],
        status: { $in: ['scheduled', 'completed'] }
    });

    if (overlapping) {
        return next(new ErrorHandler("This time slot overlaps with another booking", 409));
    }

    const booking = await Booking.create({
        doctor: doctorId,
        patient: req.user._id,
        date,
        startTime,
        endTime
    });

    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        });
});

// Doctor's view
exports.getDoctorAppointments = catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find({ doctor: req.user._id }).populate('patient', 'name email');
    res.status(200).json({ success: true, bookings });
});

// Patient's view
exports.getPatientAppointments = catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find({ patient: req.user._id }).populate('doctor', 'name specialization');
    res.status(200).json({ success: true, bookings });
});

// delete Booking
exports.deleteBooking = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new ErrorHandler('Booking not found', 404));
    }

    // Only the patient who made the booking and doctor can cancel it
    if (
        booking.patient.toString() !== req.user._id.toString() &&
        booking.doctor.toString() !== req.user._id.toString()
    ) {
        return next(new ErrorHandler('You are not authorized to cancel this booking', 403));
    }


    // Restore the time slot to doctor's availability
    const doctor = await User.findById(booking.doctor);

    const slotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    if (slotDate) {
        slotDate.time.push(booking.time);
    } else {
        doctor.availableSlots.push({ date: booking.date, time: [booking.time] });
    }

    await doctor.save();

    // Delete the booking
    await booking.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Booking deleted and slot restored.',
    });
});

exports.rescheduleBooking = catchAsyncError(async (req, res, next) => {
    const { date, time, forceCreateSlot } = req.body;
    const {startTime,endTime} = time;
    if (!date || !startTime || !endTime) {
      return next(new ErrorHandler("Please provide 'date', 'startTime' and 'endTime'", 400));
    }
  
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ErrorHandler("Booking not found", 404));
  
    if (
      booking.patient.toString() !== req.user._id.toString() &&
      booking.doctor.toString() !== req.user._id.toString()
    ) {
      return next(new ErrorHandler("You are not authorized to reschedule this booking", 403));
    }
  
    const doctor = await User.findById(booking.doctor);
    if (!doctor) return next(new ErrorHandler("Doctor not found", 404));
  
    // Check if the selected date and time are same as before
    if (
      booking.date === date &&
      booking.startTime === startTime &&
      booking.endTime === endTime
    ) {
      return next(new ErrorHandler("You have selected the same date and time", 400));
    }
  
    // Add old slot back to doctor's availability
    let oldSlotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    if (!oldSlotDate) {
      doctor.availableSlots.push({ date: booking.date, slots: [] });
      oldSlotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    }
  
    oldSlotDate.slots.push({
      startTime: booking.startTime,
      endTime: booking.endTime
    });
  
    // Check if new time is available
    let newSlotDate = doctor.availableSlots.find(slot => slot.date === date);
    const isTimeAvailable = newSlotDate?.slots?.some(slot =>
      slot.startTime === startTime && slot.endTime === endTime
    );
  
    if (!isTimeAvailable && !forceCreateSlot) {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        message: "Selected time is not available. Do you want to create it anyway?"
      });
    }
  
    // Add the new slot to availability (if not already)
    if (!newSlotDate) {
      doctor.availableSlots.push({ date, slots: [] });
      newSlotDate = doctor.availableSlots.find(slot => slot.date === date);
    }
  
    const alreadyExists = newSlotDate.slots.some(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );
  
    if (!alreadyExists) {
      newSlotDate.slots.push({ startTime, endTime });
    }
  
    // Remove the new slot (reserve it)
    newSlotDate.slots = newSlotDate.slots.filter(
      slot => !(slot.startTime === startTime && slot.endTime === endTime)
    );
  
    // Update booking
    booking.date = date;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.updatedAt = new Date();
  
    await doctor.save();
    await booking.save();
  
    res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully",
    });
  });
  

exports.viewBookingDetails = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler("Booking id is required", 400));
    const booking = await Booking.findById(id)
        .populate("doctor", "name email phone")
        .populate("patient", "name email phone")
        .populate("notes.author");

    if (!booking) return next(new ErrorHandler("Booking not found", 404));

    let bookingObj = booking.toObject(); // convert Mongoose document to plain JS object

    if (bookingObj.cancelledBy) {
        const user = await User.findById(bookingObj.cancelledBy).select("name");
        bookingObj.cancelledBy = user ? user.name : "Unknown User";
    } else {
        bookingObj.cancelledBy = null;
    }
    res.json({
        success: true,
        booking: bookingObj
    });
});


exports.updateNoteBooking = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { author, role, content } = req.body;

    if (!id) return next(new ErrorHandler("Booking id is required", 400));
    if (!content?.trim()) return next(new ErrorHandler("Note content is required", 400));

    const booking = await Booking.findById(id);
    if (!booking) return next(new ErrorHandler("Booking not found", 404));

    const lastNote = booking.notes[booking.notes.length - 1];

    if (lastNote && lastNote.author._id?.toString() === author.toString() && lastNote.role === role) {
        // Same doctor -> replace content (not append)
        lastNote.content = content;
        lastNote.updatedAt = new Date();
    } else {
        // First note OR different doctor -> add new note
        booking.notes.push({
            author, // could be author object or at least {_id}
            role,
            content,
            createdAt: new Date(),
        });
    }

    booking.updatedAt = new Date();
    await booking.save();

    res.json({ success: true, message: "Appointment notes updated successfully" });
});

exports.cancelBooking = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { author, role, content } = req.body;
    if (!id) return next(new ErrorHandler("Booking id is required", 400));
    if (!content?.trim()) return next(new ErrorHandler("Note content is required", 400));
    const booking = await Booking.findById(id);
    if (!booking) return next(new ErrorHandler("Booking not found", 400));
    if (booking.status === 'cancelled') return next(new ErrorHandler("Booking is already cancelled", 400));
    // cancelled by user
    booking.cancelledBy = author;
    // Add cancellation note
    booking.notes.push({ author, role, content });
    // Update status
    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    booking.cancelledAt = new Date();
    await booking.save();
    res.json({ success: true, message: "Appointment cancelled Successfully" });
})

exports.updateStatusAppoitment = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) return next(new ErrorHandler("Booking id is required", 400));
    if (!status?.trim()) return next(new ErrorHandler("Status is required", 400));
    const booking = await Booking.findById(id);
    if (!booking) return next(new ErrorHandler("Booking not found", 400));
    const statusMap = {
        scheduled: "upcoming",
        completed: "completed",
        cancel: "cancelled",
        cancelled: "cancelled",
    };

    const currentKey = statusMap[booking.status]; // "scheduled" -> "upcoming"
    const targetKey = statusMap[status];         // "completed" -> "completed"

    const allowedTransitions = {
        upcoming: ["completed", "cancelled"],
        completed: [],
        cancelled: ["upcoming"],
    };

    const allowed = allowedTransitions[currentKey] || [];
    if (!allowed.includes(targetKey)) return next(new ErrorHandler(`Cannot change appointment from '${booking.status}' to '${status}'`, 400));

    // Update status
    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();
    res.json({ success: true, message: "Appointment Status Updated Successfully" });
})

exports.deleteAllBookings = catchAsyncError(async (req, res, next) => {
    // Delete all documents in Booking collection
    const result = await Booking.deleteMany({});

    res.json({
        success: true,
        message: "All bookings deleted successfully",
        deletedCount: result.deletedCount
    });
});