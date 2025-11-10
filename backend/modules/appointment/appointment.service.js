const Appointment = require('appointment/appointment.model');
const User = require('user/user.model');
const ErrorHandler = require('core/utils/ErrorHandler');
const { getAppointmentQueue } = require('./appointment.queue');
const appointmentQueue = getAppointmentQueue();
const createLogger = require('core/logger/withContext');
const logger = createLogger('AppointmentService');

class AppointmentService {
  /** Validate doctor exists */
  static async bookAppointment(doctorId, patientId, appointmentData) {
    const { date, startTime, endTime } = appointmentData;
    logger.info(`Booking appointment - Doctor: ${doctorId}, Patient: ${patientId}, Date: ${date}`);

    try {
      await this.validateDoctor(doctorId);
      this.validateTime(startTime, endTime);
      await this.checkOverlappingAppointments(doctorId, patientId, date, startTime, endTime);

      const appointment = await this.createAppointment(doctorId, patientId, date, startTime, endTime);

      if (appointment) {
        logger.info(`Appointment created successfully with ID: ${appointment._id}`);
        const doctor = await User.findById(doctorId).select('name email');
        const patient = await User.findById(patientId).select('name email');

        await appointmentQueue.addConfirmation(doctor, patient, {
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
        });

        logger.info(`Confirmation email job queued for appointment ID: ${appointment._id}`);
      }

      return { appointment };
    } catch (error) {
      logger.error(`Failed to book appointment: ${error.message}`, error);
      throw error;
    }
  }

  static async validateDoctor(doctorId) {
    logger.info(`Validating doctor with ID: ${doctorId}`);
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      logger.warn(`Doctor not found with ID: ${doctorId}`);
      throw new ErrorHandler('Doctor not found', 404);
    }
    return doctor;
  }

  /** Validate time slot */
  static validateTime(startTime, endTime) {
    logger.info(`Validating time range: ${startTime} - ${endTime}`);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const start = new Date(0, 0, 0, sh, sm);
    const end = new Date(0, 0, 0, eh, em);
    if (end <= start) {
      logger.warn(`Invalid time range: endTime must be after startTime`);
      throw new ErrorHandler('endTime must be after startTime', 400);
    }
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
    logger.info(`Checking overlapping appointments for Doctor: ${doctorId}, Patient: ${patientId}, Date: ${date}`);

    const existingSlot = await Appointment.findOne({
      doctor: doctorId,
      patient: patientId,
      date,
      startTime,
      endTime,
      isSlotReusable: false 
    });

    if (existingSlot) {
      logger.warn(`Patient ${patientId} already booked this exact slot before`);
      throw new ErrorHandler('You have already booked this exact slot before', 409);
    }

    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      status: { $in: ['scheduled', 'approved'] },
      startTime,
      endTime
    });

    if (doctorConflict) {
      logger.warn(`Doctor ${doctorId} has overlapping appointment at this time`);
      throw new ErrorHandler('This slot is already booked for the doctor', 409);
    }
  }

  /** Create appointment */
  static async createAppointment(doctorId, patientId, date, startTime, endTime) {
    logger.info(`Creating appointment for Doctor: ${doctorId}, Patient: ${patientId}, Date: ${date}`);
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
    logger.info(`Fetching appointments for Doctor ID: ${doctorId}`);
    return await Appointment.find({ doctor: doctorId }).populate('patient', 'name email');
  }

  /** Get patient appointments */
  static async getPatientAppointments(patientId) {
    logger.info(`Fetching appointments for Patient ID: ${patientId}`);
    return await Appointment.find({ patient: patientId }).populate('doctor', 'name specialization');
  }

  /** Find appointment by ID */
  static async findAppointmentById(appointmentId) {
    logger.info(`Finding appointment by ID: ${appointmentId}`);
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      logger.warn(`Appointment not found with ID: ${appointmentId}`);
      throw new ErrorHandler('Appointment not found', 404);
    }
    return appointment;
  }

  /** Ensure user owns or is part of appointment */
  static async authorizeAppointmentAccess(appointment, userId) {
    logger.info(`Authorizing access for User: ${userId} on Appointment: ${appointment._id}`);
    if (
      appointment.patient.toString() !== userId.toString() &&
      appointment.doctor.toString() !== userId.toString()
    ) {
      logger.warn(`User ${userId} is not authorized to access Appointment ${appointment._id}`);
      throw new ErrorHandler('You are not authorized to access this appointment', 403);
    }
  }

  /** Delete appointment */
  static async deleteAppointment(appointmentId, userId) {
    logger.info(`Deleting appointment ID: ${appointmentId} by User: ${userId}`);
    const appointment = await this.findAppointmentById(appointmentId);
    await this.authorizeAppointmentAccess(appointment, userId);

    const doctor = await User.findById(appointment.doctor);
    const slotDate = doctor.availableSlots.find(slot => slot.date === appointment.date);

    if (slotDate) {
      slotDate.slots.push({ startTime: appointment.startTime, endTime: appointment.endTime });
    } else {
      doctor.availableSlots.push({
        date: appointment.date,
        slots: [{ startTime: appointment.startTime, endTime: appointment.endTime }],
      });
    }

    await doctor.save();
    await appointment.deleteOne();

    logger.info(`Appointment ${appointmentId} deleted successfully and slot restored.`);
    return { message: 'Appointment deleted and slot restored.' };
  }

  /** Reschedule appointment */
  static async rescheduleAppointment(appointmentId, userId, { date, time, forceCreateSlot }) {
    logger.info(`Rescheduling appointment ID: ${appointmentId} by User: ${userId}`);
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
      logger.warn(`Requested new slot not available for doctor ${doctor._id}`);
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

    // Remove reserved slot
    newSlotDate.slots = newSlotDate.slots.filter(
      slot => !(slot.startTime === startTime && slot.endTime === endTime)
    );

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.updatedAt = new Date();

    await doctor.save();
    await appointment.save();

    logger.info(`Appointment ${appointmentId} rescheduled successfully`);
    return { message: 'Appointment rescheduled successfully' };
  }

  /** Appointment details */
  static async getAppointmentDetails(appointmentId) {
    logger.info(`Fetching details for Appointment ID: ${appointmentId}`);
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name email phone')
      .populate('patient', 'name email phone')
      .populate('notes.author');

    if (!appointment) {
      logger.warn(`Appointment not found: ${appointmentId}`);
      throw new ErrorHandler('Appointment not found', 404);
    }

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
    logger.info(`Updating notes for Appointment ID: ${appointmentId}`);
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

    logger.info(`Notes updated for Appointment ID: ${appointmentId}`);
    return { message: 'Appointment notes updated successfully' };
  }

  /** Cancel appointment */
  static async cancelAppointment(appointmentId, { author, role, content }) {
    logger.info(`Cancelling Appointment ID: ${appointmentId}`);
    const appointment = await this.findAppointmentById(appointmentId);
    if (appointment.status === 'cancelled') {
      logger.warn(`Appointment already cancelled: ${appointmentId}`);
      throw new ErrorHandler('Appointment is already cancelled', 400);
    }

    appointment.cancelledBy = author;
    appointment.notes.push({ author, role, content });
    appointment.status = 'cancelled';
    appointment.updatedAt = new Date();
    appointment.cancelledAt = new Date();

    await appointment.save();
    logger.warn(`Appointment ${appointmentId} cancelled by ${author}`);
    return { message: 'Appointment cancelled successfully' };
  }

  /** Update status */
  static async updateAppointmentStatus(appointmentId, status) {
    logger.info(`Updating status for Appointment ID: ${appointmentId} to ${status}`);
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
      logger.warn(`Invalid status transition: ${appointment.status} -> ${status}`);
      throw new ErrorHandler(
        `Cannot change appointment from '${appointment.status}' to '${status}'`,
        400
      );
    }

    appointment.status = status;
    appointment.updatedAt = new Date();
    await appointment.save();

    logger.info(`Appointment ${appointmentId} status updated to ${status}`);
    return { message: 'Appointment status updated successfully' };
  }

  /** Delete all */
  static async deleteAllAppointments() {
    logger.warn('Deleting all appointments');
    const result = await Appointment.deleteMany({});
    logger.info(`Deleted ${result.deletedCount} appointments`);
    return {
      message: 'All appointments deleted successfully',
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = AppointmentService;
