const User = require('./user.model');
const ErrorHandler = require('core/utils/ErrorHandler');

class DoctorService{
  // Add Doctor Slots
  static async addDoctorSlots (reqUserId, { date, slots }) {
    if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
      throw new ErrorHandler('Date and slots are required', 400);
    }
  
    const user = await User.findById(reqUserId);
    if (!user || user.role !== 'doctor') {
      throw new ErrorHandler('Only doctors can add slots', 403);
    }
  
    let existingSlot = user.availableSlots.find(slot => slot.date === date);
  
    if (!existingSlot) {
      existingSlot = { date, slots: [] };
      user.availableSlots.push(existingSlot);
    }
  
    for (const newSlot of slots) {
      const [newStartHour, newStartMin] = newSlot.startTime.split(':').map(Number);
      const [newEndHour, newEndMin] = newSlot.endTime.split(':').map(Number);
      const newStart = new Date(0, 0, 0, newStartHour, newStartMin);
      const newEnd = new Date(0, 0, 0, newEndHour, newEndMin);
  
      if (newEnd <= newStart) {
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
        throw new ErrorHandler(
          `Slot overlaps with existing slot: ${newSlot.startTime} - ${newSlot.endTime}`,
          400
        );
      }
  
      existingSlot.slots.push(newSlot);
    }
  
    await user.save();
    return { message: 'Slots updated successfully' };
  };
  // Get Doctor Slots
  static async getDoctorSlots(reqUserId) {
    const user = await User.findById(reqUserId);
    if (!user) throw new ErrorHandler('User not found', 404);
    if (user.role !== 'doctor') throw new ErrorHandler('Only doctors can view slots', 403);
  
    return user.availableSlots || [];
  };
  
  // Update Doctor Slots After Booking
  static async updateDoctorSlotsAfterBooking({ doctorId, date, time }){
    if (!doctorId || !date || !time) {
      throw new ErrorHandler('doctorId, date, and time are required', 400);
    }
  
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      'availableSlots.date': date,
    });
  
    if (!doctor) throw new ErrorHandler('Doctor or slot not found', 404);
  
    await User.updateOne(
      { _id: doctorId, 'availableSlots.date': date },
      { $pull: { 'availableSlots.$.time': time } }
    );
  
    return { message: "Slot removed from doctor's availability" };
  };
  
  // Get Doctors by Specialization
  static async getDoctorsBySpecialization(specialization){
    const query = { role: 'doctor' };
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
  
    const doctors = await User.find(query).select('-password');
    return { count: doctors.length, doctors };
  };
  
  // Delete Single Time Slot
  static async deleteSingleTimeSlot(reqUserId, { date, time }){
    if (!date || !time) throw new ErrorHandler('Date and time are required', 400);
  
    const user = await User.findById(reqUserId);
    if (user.role !== 'doctor') throw new ErrorHandler('Only doctors can update slots', 403);
  
    const slot = user.availableSlots.find(slot => slot.date === date);
    if (!slot) throw new ErrorHandler('No slots found for this date', 404);
  
    slot.time = slot.time.filter(t => t !== time);
    if (slot.time.length === 0) {
      user.availableSlots = user.availableSlots.filter(s => s.date !== date);
    }
  
    await user.save();
    return {
      message: `Time ${time} on ${date} deleted successfully.`,
      availableSlots: user.availableSlots,
    };
  };
  
  // Delete All Slots for a Date
  static async deleteAllSlotsForDate(reqUserId, { date }){
    if (!date) throw new ErrorHandler('Date is required', 400);
  
    const user = await User.findById(reqUserId);
    if (user.role !== 'doctor') throw new ErrorHandler('Only doctors can update slots', 403);
  
    const existingSlot = user.availableSlots.find(slot => slot.date === date);
    if (!existingSlot) throw new ErrorHandler('No slots found for this date', 404);
  
    user.availableSlots = user.availableSlots.filter(slot => slot.date !== date);
    await user.save();
  
    return {
      message: `All slots for ${date} deleted successfully.`,
      availableSlots: user.availableSlots,
    };
  };
  
  // Get Doctor by ID
  static async getDoctorById(doctorId){
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) throw new ErrorHandler('Doctor not found', 404);
  
    return {
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      availableSlots: doctor.availableSlots,
    };
  };
  
  // Get All Unique Specializations
  static async getSpecializations() {
    const doctors = await User.find({ role: 'doctor' }, 'specialization');
    const specializations = doctors
      .map(doc => doc.specialization?.trim().toLowerCase())
      .filter(Boolean);
    const uniqueSpecs = [...new Set(specializations)];
    return uniqueSpecs;
  };
  
  // Get All Doctors
  static async getAllDoctors() {
    const doctors = await User.find({ role: 'doctor' });
    if (!doctors || doctors.length === 0) throw new ErrorHandler('Doctors not found', 400);
    return doctors;
  };

}
module.exports = DoctorService;