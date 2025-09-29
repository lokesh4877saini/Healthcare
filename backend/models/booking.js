const mongoose = require('mongoose');
const ErrorHandler = require('../utils/ErrorHandler');

const bookingSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  startTime: {  // e.g., "09:30"
    type: String,
    required: true,
  },
  endTime: {    // e.g., "10:30"
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  notes: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      role: { type: String, enum: ['doctor', 'patient'] },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancelledAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  }
});
bookingSchema.pre('save', function (next) {
  const [startHour, startMin] = this.startTime.split(':').map(Number);
  const [endHour, endMin] = this.endTime.split(':').map(Number);
  const startDate = new Date(0, 0, 0, startHour, startMin);
  const endDate = new Date(0, 0, 0, endHour, endMin);
  if (endDate <= startDate) {
    return next(new ErrorHandler('endTime must be after startTime',400));
  }
  next();
});
module.exports = mongoose.model('Booking', bookingSchema);
