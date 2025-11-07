const Appointment = require('appointment/appointment.model'); // previously Booking
const User = require('user/user.model');
const ErrorHandler = require('core/utils/ErrorHandler');
const { getAppointmentQueue } = require('./appointment.queue');
const appointmentQueue = getAppointmentQueue();

class AppointmentService {
  /** Validate doctor exists */
  static async bookAppointment(doctorId, patientId, appointmentData) {
    const { date, startTime, endTime } = appointmentData;

    // Validate doctor and times
    await this.validateDoctor(doctorId);

    // Validate timing
    this.validateTime(startTime, endTime);

    // Prevent overlapping bookings
    await this.checkOverlappingAppointments(doctorId, patientId, date, startTime, endTime);


    // Create appointment
    const appointment = await this.createAppointment(doctorId, patientId, date, startTime, endTime);

    //  If created successfully → queue confirmation email
    // if (appointment) {
    //   const doctor = await User.findById(doctorId).select('name email');
    //   const patient = await User.findById(patientId).select('name email');

    //   // Add appointment confirmation job
    //   await appointmentQueue.addAppointmentConfirmation(doctor, patient, {
    //     date: appointment.date,
    //     startTime: appointment.startTime,
    //     endTime: appointment.endTime,
    //   });
    //   console.log('Appointment booked and email jobs queued.');
    // }
    return { appointment };
  }

  static async validateDoctor(doctorId) {
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) throw new ErrorHandler('Doctor not found', 404);
    return doctor;
  }

  /** Validate time slot */
  static validateTime(startTime, endTime) {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(0, 0, 0, sh, sm);
    const end = new Date(0, 0, 0, eh, em);
    if (end <= start) throw new ErrorHandler('endTime must be after startTime', 400);
  }
  static timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  static buildTimeRangeQuery(startTime, endTime, fieldStart = 'startTime', fieldEnd = 'endTime') {
    const startMin = this.timeToMinutes(startTime);
    const endMin = this.timeToMinutes(endTime);

    return {
      $expr: {
        $and: [
          { $lt: [`$${fieldStart}`, endMin] },
          { $gt: [`$${fieldEnd}`, startMin] }
        ]
      }
    };
  }


  /** Check overlapping appointments */
  static async checkOverlappingAppointments(doctorId, patientId, date, startTime, endTime) {
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    //  Prevent patient from booking the same slot ever
    const patientConflict = await Appointment.findOne({
      patient: patientId,
      date,
      $expr: {
        $and: [
          { $eq: ['$startTimeMinutes', startMinutes] },
          { $eq: ['$endTimeMinutes', endMinutes] }
        ]
      }
    });

    if (patientConflict) {
      throw new ErrorHandler('You have already booked this slot before', 409);
    }

    //  Prevent doctor overlapping active appointments
    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      status: { $in: ['scheduled', 'approved'] },
      $expr: {
        $and: [
          { $lt: ['$startTimeMinutes', endMinutes] },
          { $gt: ['$endTimeMinutes', startMinutes] }
        ]
      }
    });

    if (doctorConflict) {
      throw new ErrorHandler('This slot is already booked for the doctor', 409);
    }
  }



  /** Create appointment */
  static async createAppointment(doctorId, patientId, date, startTime, endTime) {
    return await Appointment.create({
      doctor: doctorId,
      patient: patientId,
      date,
      startTime,
      endTime,
    });
  }

  /** Get doctor appointments */
  static async getDoctorAppointments(doctorId) {
    return await Appointment.find({ doctor: doctorId }).populate('patient', 'name email');
  }

  /** Get patient appointments */
  static async getPatientAppointments(patientId) {
    return await Appointment.find({ patient: patientId }).populate('doctor', 'name specialization');
  }

  /** Find appointment by ID */
  static async findAppointmentById(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ErrorHandler('Appointment not found', 404);
    return appointment;
  }

  /** Ensure user owns or is part of appointment */
  static async authorizeAppointmentAccess(appointment, userId) {
    if (
      appointment.patient.toString() !== userId.toString() &&
      appointment.doctor.toString() !== userId.toString()
    ) {
      throw new ErrorHandler('You are not authorized to access this appointment', 403);
    }
  }

  /** Delete appointment */
  static async deleteAppointment(appointmentId, userId) {
    const appointment = await this.findAppointmentById(appointmentId);
    await this.authorizeAppointmentAccess(appointment, userId);

    const doctor = await User.findById(appointment.doctor);
    const slotDate = doctor.availableSlots.find(slot => slot.date === appointment.date);

    if (slotDate) {
      // ✅ fixed: appointment.time doesn’t exist — use startTime/endTime
      slotDate.slots.push({ startTime: appointment.startTime, endTime: appointment.endTime });
    } else {
      doctor.availableSlots.push({
        date: appointment.date,
        slots: [{ startTime: appointment.startTime, endTime: appointment.endTime }],
      });
    }

    await doctor.save();
    await appointment.deleteOne();

    return { message: 'Appointment deleted and slot restored.' };
  }

  /** Reschedule appointment */
  static async rescheduleAppointment(appointmentId, userId, { date, time, forceCreateSlot }) {
    const { startTime, endTime } = time;
    const appointment = await this.findAppointmentById(appointmentId);
    await this.authorizeAppointmentAccess(appointment, userId);

    const doctor = await User.findById(appointment.doctor);
    if (!doctor) throw new ErrorHandler('Doctor not found', 404);

    if (
      appointment.date === date &&
      appointment.startTime === startTime &&
      appointment.endTime === endTime
    ) {
      throw new ErrorHandler('You have selected the same date and time', 400);
    }

    // Restore old slot
    let oldSlotDate = doctor.availableSlots.find(slot => slot.date === appointment.date);
    if (!oldSlotDate) {
      doctor.availableSlots.push({ date: appointment.date, slots: [] });
      oldSlotDate = doctor.availableSlots.find(slot => slot.date === appointment.date);
    }
    oldSlotDate.slots.push({ startTime: appointment.startTime, endTime: appointment.endTime });

    // Validate new slot
    let newSlotDate = doctor.availableSlots.find(slot => slot.date === date);
    const isTimeAvailable = newSlotDate?.slots?.some(
      slot => slot.startTime === startTime && slot.endTime === endTime
    );

    if (!isTimeAvailable && !forceCreateSlot) {
      return {
        requiresConfirmation: true,
        message: 'Selected time is not available. Do you want to create it anyway?',
      };
    }

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

    // Remove the reserved slot
    newSlotDate.slots = newSlotDate.slots.filter(
      slot => !(slot.startTime === startTime && slot.endTime === endTime)
    );

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.updatedAt = new Date();

    await doctor.save();
    await appointment.save();

    return { message: 'Appointment rescheduled successfully' };
  }

  /** Appointment details */
  static async getAppointmentDetails(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email phone')
      .populate('notes.author');

    if (!appointment) throw new ErrorHandler('Appointment not found', 404);

    const appointmentObj = appointment.toObject();

    if (appointmentObj.cancelledBy) {
      const user = await User.findById(appointmentObj.cancelledBy).select('name');
      appointmentObj.cancelledBy = user ? user.name : 'Unknown User';
    } else {
      appointmentObj.cancelledBy = null;
    }

    return appointmentObj;
  }

  /** Update notes */
  static async updateAppointmentNote(appointmentId, { author, role, content }) {
    const appointment = await this.findAppointmentById(appointmentId);

    const lastNote = appointment.notes[appointment.notes.length - 1];
    if (lastNote && lastNote.author?._id?.toString() === author.toString() && lastNote.role === role) {
      lastNote.content = content;
      lastNote.updatedAt = new Date();
    } else {
      appointment.notes.push({ author, role, content, createdAt: new Date() });
    }

    appointment.updatedAt = new Date();
    await appointment.save();

    return { message: 'Appointment notes updated successfully' };
  }

  /** Cancel appointment */
  static async cancelAppointment(appointmentId, { author, role, content }) {
    const appointment = await this.findAppointmentById(appointmentId);
    if (appointment.status === 'cancelled') {
      throw new ErrorHandler('Appointment is already cancelled', 400);
    }

    appointment.cancelledBy = author;
    appointment.notes.push({ author, role, content });
    appointment.status = 'cancelled';
    appointment.updatedAt = new Date();
    appointment.cancelledAt = new Date();

    await appointment.save();
    return { message: 'Appointment cancelled successfully' };
  }

  /** Update status */
  static async updateAppointmentStatus(appointmentId, status) {
    const appointment = await this.findAppointmentById(appointmentId);

    const statusMap = {
      scheduled: 'upcoming',
      completed: 'completed',
      cancel: 'cancelled',
      cancelled: 'cancelled',
    };

    const currentKey = statusMap[appointment.status];
    const targetKey = statusMap[status];

    const allowedTransitions = {
      upcoming: ['completed', 'cancelled'],
      completed: [],
      cancelled: ['upcoming'],
    };

    const allowed = allowedTransitions[currentKey] || [];
    if (!allowed.includes(targetKey)) {
      throw new ErrorHandler(
        `Cannot change appointment from '${appointment.status}' to '${status}'`,
        400
      );
    }

    appointment.status = status;
    appointment.updatedAt = new Date();
    await appointment.save();

    return { message: 'Appointment status updated successfully' };
  }

  /** Delete all */
  static async deleteAllAppointments() {
    const result = await Appointment.deleteMany({});
    return {
      message: 'All appointments deleted successfully',
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = AppointmentService;
