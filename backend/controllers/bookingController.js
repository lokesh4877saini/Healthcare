const Booking = require('../models/booking');
const User = require('../models/user');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/catchAsyncError');

exports.bookAppointment = catchAsyncError(async (req, res, next) => {
    const { doctorId, date, time } = req.body;

    // Check doctor existence
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
        return next(new ErrorHandler("Doctor not found", 404));
    }

    // Check if doctor has the slot available
    const slot = doctor.availableSlots.find(s => s.date === date && s.time.includes(time));
    if (!slot) {
        return next(new ErrorHandler("Selected time slot is not available", 400));
    }

    // Prevent double booking
    const existing = await Booking.findOne({ doctor: doctorId, date, time });
    if (existing) {
        return next(new ErrorHandler("This slot is already booked", 400));
    }

    const booking = await Booking.create({
        doctor: doctorId,
        patient: req.user._id,
        date,
        time,
    });

    // Update doctor’s available slots
    slot.time = slot.time.filter(t => t !== time); // remove booked time
    doctor.availableSlots = doctor.availableSlots.map(s => s.date === date ? slot : s);
    await doctor.save();

    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        booking,
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

    if (!date || !time) {
        return next(new ErrorHandler("Please provide new 'date' and 'time'", 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return next(new ErrorHandler('Booking not found', 404));
    }

    if (booking.patient.toString() !== req.user._id.toString() && booking.doctor.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler('You are not authorized to reschedule this booking', 403));
    }

    const doctor = await User.findById(booking.doctor);
    if (!doctor) {
        return next(new ErrorHandler('Doctor not found', 404));
    }

    if (booking.date === date && booking.time === time) {
        return next(new ErrorHandler("You have selected the same date and time", 400));
    }

    // Add the old time back to the doctor's availability
    let oldSlot = doctor.availableSlots.find(slot => slot.date === booking.date);
    if (oldSlot) {
        oldSlot.time.push(booking.time);
    } else {
        doctor.availableSlots.push({ date: booking.date, time: [booking.time] });
    }

    // Check if selected new date/time is available
    let newSlot = doctor.availableSlots.find(slot => slot.date === date);
    const isTimeAvailable = newSlot && newSlot.time.includes(time);

    // If not available and doctor didn't confirm creation
    if (!isTimeAvailable && !forceCreateSlot) {
        return res.status(409).json({
            success: false,
            requiresConfirmation: true,
            message: "The selected time is not currently available. Do you want to add this slot and continue?",
        });
    }

    // If confirmed or time already exists
    if (!newSlot) {
        doctor.availableSlots.push({ date, time: [] });
        newSlot = doctor.availableSlots.find(slot => slot.date === date);
    }

    if (!newSlot.time.includes(time)) {
        newSlot.time.push(time);
    }

    // Remove the selected time to "reserve" it
    newSlot.time = newSlot.time.filter(t => t !== time);

    // Update booking
    booking.date = date;
    booking.time = time;
    booking.updatedAt = new Date();

    await doctor.save();
    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Booking rescheduled successfully',
        booking
    });
});

exports.viewBookingDetails = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new ErrorHandler("Booking id is required", 400));
    const booking = await Booking.findById(id)
        .populate("doctor", "name email phone") // select only needed fields
        .populate("patient", "name email phone")
        .populate("notes.author");
    if (!booking) return next(new ErrorHandler("Booking not found", 404));
    res.json({
        success: true,
        booking
    })
})

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