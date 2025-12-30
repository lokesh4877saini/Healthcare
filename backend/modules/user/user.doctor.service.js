const User = require('./user.model');
const ErrorHandler = require('core/utils/ErrorHandler');
const createLogger = require('core/logger/withContext');

const logger = createLogger('DoctorService');

class DoctorService {
  // Add Doctor Slots
  static async addDoctorSlots(reqUserId, { date, slots }) {
    logger.info('Adding doctor slots...', { doctorId: reqUserId, date, slotCount: slots?.length });

    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      logger.warn('Invalid slot data received');
      throw new ErrorHandler('Date and slots are required', 400);
    }

    const user = await User.findById(reqUserId);
    if (!user || user.role !== 'doctor') {
      logger.warn('Unauthorized slot creation attempt', { userId: reqUserId });
      throw new ErrorHandler('Only doctors can add slots', 403);
    }

    let existingSlot = user.availableSlots.find(slot => slot.date === date);

    if (!existingSlot) {
      user.availableSlots.push({ date, slots });
      logger.info('New date entry created for doctor slots', { date });
    } else {
      for (const newSlot of slots) {
        const [newStartHour, newStartMin] = newSlot.startTime.split(':').map(Number);
        const [newEndHour, newEndMin] = newSlot.endTime.split(':').map(Number);
        const newStart = new Date(0, 0, 0, newStartHour, newStartMin);
        const newEnd = new Date(0, 0, 0, newEndHour, newEndMin);

        if (newEnd <= newStart) {
          logger.error('Invalid time slot: endTime <= startTime', newSlot);
          throw new ErrorHandler(
            `Invalid slot: endTime must be after startTime (${newSlot.startTime} - ${newSlot.endTime})`,
            400
          );
        }

        const isOverlap = existingSlot.slots.some(existing => {
          const [existStartHour, existStartMin] = existing.startTime.split(':').map(Number);
          const [existEndHour, existEndMin] = existing.endTime.split(':').map(Number);
          const existStart = new Date(0, 0, 0, existStartHour, existStartMin);
          const existEnd = new Date(0, 0, 0, existEndHour, existEndMin);
          return newStart < existEnd && newEnd > existStart;
        });

        if (isOverlap) {
          logger.warn('Detected overlapping slot', newSlot);
          throw new ErrorHandler(
            `Slot overlaps with existing slot: ${newSlot.startTime} - ${newSlot.endTime}`,
            400
          );
        }

        existingSlot.slots.push(newSlot);
      }
    }

    await user.save();
    logger.info('Doctor slots saved successfully', { doctorId: reqUserId, date });
    return { message: 'Slots updated successfully' };
  }

  // Get Doctor Slots
  static async getDoctorSlots(reqUserId) {
    logger.info('Fetching doctor slots...', { doctorId: reqUserId });

    const user = await User.findById(reqUserId);
    if (!user) throw new ErrorHandler('User not found', 404);
    if (user.role !== 'doctor') throw new ErrorHandler('Only doctors can view slots', 403);

    logger.info('Doctor slots fetched successfully', { slotCount: user.availableSlots?.length || 0 });
    return user.availableSlots || [];
  }

  // Update Doctor Slots After Booking
  static async updateDoctorSlotsAfterBooking({ doctorId, date, time }) {
    logger.info('Updating doctor slots after booking', { doctorId, date, time });

    if (!doctorId || !date || !time) {
      throw new ErrorHandler('doctorId, date, and time are required', 400);
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      'availableSlots.date': date,
    });

    if (!doctor) {
      logger.warn('Doctor or slot not found', { doctorId, date });
      throw new ErrorHandler('Doctor or slot not found', 404);
    }

    await User.updateOne(
      { _id: doctorId, 'availableSlots.date': date },
      { $pull: { 'availableSlots.$.time': time } }
    );

    logger.info('Slot removed from availability', { doctorId, date, time });
    return { message: "Slot removed from doctor's availability" };
  }

  // Get Doctors by Specialization
  static async getDoctorsBySpecialization(specialization) {
    logger.info('Fetching doctors by specialization', { specialization });

    const query = { role: 'doctor' };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await User.find(query).select('-password');
    logger.info('Doctors fetched', { count: doctors.length });
    return { count: doctors.length, doctors };
  }

  // Delete Single Time Slot
  static async deleteSingleTimeSlot(reqUserId, { date, slotId }) {
    logger.info('Deleting single doctor slot', { doctorId: reqUserId, date, slotId });

    if (!date || !slotId) throw new ErrorHandler('Date and slotId are required', 400);

    const user = await User.findById(reqUserId);
    if (!user || user.role !== 'doctor') throw new ErrorHandler('Only doctors can update slots', 403);

    const slotDate = user.availableSlots.find(slot => slot.date === date);
    if (!slotDate) throw new ErrorHandler('No slots found for this date', 404);

    slotDate.slots = slotDate.slots.filter(s => s._id.toString() !== slotId.toString());

    if (slotDate.slots.length === 0) {
      user.availableSlots = user.availableSlots.filter(s => s.date !== date);
    }

    await user.save();
    logger.info('Single slot deleted successfully', { doctorId: reqUserId, date, slotId });
    return {
      message: `Time on ${date} deleted successfully.`,
      availableSlots: user.availableSlots,
    };
  }

  // Delete All Slots for a Date
  static async deleteAllSlotsForDate(reqUserId, { date }) {
    logger.info('Deleting all slots for date', { doctorId: reqUserId, date });

    if (!date) throw new ErrorHandler('Date is required', 400);

    const user = await User.findById(reqUserId);
    if (user.role !== 'doctor') throw new ErrorHandler('Only doctors can update slots', 403);

    const existingSlot = user.availableSlots.find(slot => slot.date === date);
    if (!existingSlot) throw new ErrorHandler('No slots found for this date', 404);

    user.availableSlots = user.availableSlots.filter(slot => slot.date !== date);
    await user.save();

    logger.info('All slots for date deleted successfully', { doctorId: reqUserId, date });
    return {
      message: `All slots for ${date} deleted successfully.`,
      availableSlots: user.availableSlots,
    };
  }

  // Get Doctor by ID
  static async getDoctorById(doctorId) {
    logger.info('Fetching doctor by ID', { doctorId });

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) throw new ErrorHandler('Doctor not found', 404);

    logger.info('Doctor details fetched', { doctorId });
    return {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots,
    };
  }

  // Get All Unique Specializations
  static async getSpecializations() {
    logger.info('Fetching all unique doctor specializations');

    const doctors = await User.find({ role: 'doctor' }, 'specialization');
    const specializations = doctors
      .map(doc => doc.specialization?.trim().toLowerCase())
      .filter(Boolean);
    const uniqueSpecs = [...new Set(specializations)];

    logger.info('Unique specializations fetched', { count: uniqueSpecs.length });
    return uniqueSpecs;
  }

  // Get All Doctors
  static async getAllDoctors() {
    logger.info('Fetching all doctors');

    const doctors = await User.find({ role: 'doctor' });
    if (!doctors || doctors.length === 0) {
      logger.warn('No doctors found');
      throw new ErrorHandler('Doctors not found', 400);
    }

    logger.info('All doctors fetched successfully', { count: doctors.length });
    return doctors;
  }
}

module.exports = DoctorService;
