const Booking = require('../models/booking');
const User = require('../models/user');
const { ErrorHandler } = require('../utils/ErrorHandler');

class BookingService {
  // Validation methods
  static async validateDoctor(doctorId) {
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }
    return doctor;
  }

  static validateTime(startTime, endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(0, 0, 0, sh, sm);
    const end = new Date(0, 0, 0, eh, em);
    
    if (end <= start) {
      throw new ErrorHandler("endTime must be after startTime", 400);
    }
  }

  static async checkOverlappingAppointments(doctorId, date, startTime, endTime) {
    const overlapping = await Booking.findOne({
      doctor: doctorId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ],
      status: { $in: ['scheduled', 'completed'] }
    });

    if (overlapping) {
      throw new ErrorHandler("This time slot overlaps with another booking", 409);
    }
  }

  static async createBooking(doctorId, patientId, date, startTime, endTime) {
    return await Booking.create({
      doctor: doctorId,
      patient: patientId,
      date,
      startTime,
      endTime
    });
  }

  static async getDoctorAppointments(doctorId) {
    return await Booking.find({ doctor: doctorId }).populate('patient', 'name email');
  }

  static async getPatientAppointments(patientId) {
    return await Booking.find({ patient: patientId }).populate('doctor', 'name specialization');
  }

  static async findBookingById(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ErrorHandler('Booking not found', 404);
    }
    return booking;
  }

  static async authorizeBookingAccess(booking, userId) {
    if (
      booking.patient.toString() !== userId.toString() &&
      booking.doctor.toString() !== userId.toString()
    ) {
      throw new ErrorHandler('You are not authorized to access this booking', 403);
    }
  }

  static async deleteBooking(bookingId, userId) {
    const booking = await this.findBookingById(bookingId);
    await this.authorizeBookingAccess(booking, userId);

    // Restore time slot to doctor's availability
    const doctor = await User.findById(booking.doctor);
    const slotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    
    if (slotDate) {
      slotDate.time.push(booking.time);
    } else {
      doctor.availableSlots.push({ date: booking.date, time: [booking.time] });
    }

    await doctor.save();
    await booking.deleteOne();

    return { message: 'Booking deleted and slot restored.' };
  }

  static async rescheduleBooking(bookingId, userId, { date, time, forceCreateSlot }) {
    const { startTime, endTime } = time;
    
    const booking = await this.findBookingById(bookingId);
    await this.authorizeBookingAccess(booking, userId);

    const doctor = await User.findById(booking.doctor);
    if (!doctor) throw new ErrorHandler("Doctor not found", 404);

    // Check if same date and time
    if (booking.date === date && booking.startTime === startTime && booking.endTime === endTime) {
      throw new ErrorHandler("You have selected the same date and time", 400);
    }

    // Add old slot back to availability
    let oldSlotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    if (!oldSlotDate) {
      doctor.availableSlots.push({ date: booking.date, slots: [] });
      oldSlotDate = doctor.availableSlots.find(slot => slot.date === booking.date);
    }
    oldSlotDate.slots.push({
      startTime: booking.startTime,
      endTime: booking.endTime
    });

    // Check new time availability
    let newSlotDate = doctor.availableSlots.find(slot => slot.date === date);
    const isTimeAvailable = newSlotDate?.slots?.some(slot =>
      slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isTimeAvailable && !forceCreateSlot) {
      return {
        requiresConfirmation: true,
        message: "Selected time is not available. Do you want to create it anyway?"
      };
    }

    // Add new slot to availability
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

    return { message: "Booking rescheduled successfully" };
  }

  static async getBookingDetails(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate("doctor", "name email phone")
      .populate("patient", "name email phone")
      .populate("notes.author");

    if (!booking) {
      throw new ErrorHandler("Booking not found", 404);
    }

    let bookingObj = booking.toObject();

    if (bookingObj.cancelledBy) {
      const user = await User.findById(bookingObj.cancelledBy).select("name");
      bookingObj.cancelledBy = user ? user.name : "Unknown User";
    } else {
      bookingObj.cancelledBy = null;
    }

    return bookingObj;
  }

  static async updateBookingNote(bookingId, { author, role, content }) {
    const booking = await this.findBookingById(bookingId);
    
    const lastNote = booking.notes[booking.notes.length - 1];

    if (lastNote && lastNote.author._id?.toString() === author.toString() && lastNote.role === role) {
      lastNote.content = content;
      lastNote.updatedAt = new Date();
    } else {
      booking.notes.push({
        author,
        role,
        content,
        createdAt: new Date(),
      });
    }

    booking.updatedAt = new Date();
    await booking.save();

    return { message: "Appointment notes updated successfully" };
  }

  static async cancelBooking(bookingId, { author, role, content }) {
    const booking = await this.findBookingById(bookingId);
    
    if (booking.status === 'cancelled') {
      throw new ErrorHandler("Booking is already cancelled", 400);
    }

    booking.cancelledBy = author;
    booking.notes.push({ author, role, content });
    booking.status = 'cancelled';
    booking.updatedAt = new Date();
    booking.cancelledAt = new Date();

    await booking.save();
    return { message: "Appointment cancelled successfully" };
  }

  static async updateBookingStatus(bookingId, status) {
    const booking = await this.findBookingById(bookingId);
    
    const statusMap = {
      scheduled: "upcoming",
      completed: "completed",
      cancel: "cancelled",
      cancelled: "cancelled",
    };

    const currentKey = statusMap[booking.status];
    const targetKey = statusMap[status];

    const allowedTransitions = {
      upcoming: ["completed", "cancelled"],
      completed: [],
      cancelled: ["upcoming"],
    };

    const allowed = allowedTransitions[currentKey] || [];
    if (!allowed.includes(targetKey)) {
      throw new ErrorHandler(`Cannot change appointment from '${booking.status}' to '${status}'`, 400);
    }

    booking.status = status;
    booking.updatedAt = new Date();
    await booking.save();

    return { message: "Appointment status updated successfully" };
  }

  static async deleteAllBookings() {
    const result = await Booking.deleteMany({});
    return {
      message: "All bookings deleted successfully",
      deletedCount: result.deletedCount
    };
  }
}

module.exports = BookingService;