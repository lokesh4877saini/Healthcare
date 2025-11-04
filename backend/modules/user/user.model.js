
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [30, "Name can't exceed 30 characters"],
    minLength: [3, 'Name should have at least 3 characters'],
  },

  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email address'],
  },

  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password should be at least 8 characters long'],
    select: false,
  },

  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },

  specialization: {
    type: String,
    default: '',
  },

  phone: {
    type: String,
  },

  availableSlots: [
    {
      date: { type: String },
      slots: [
        {
          startTime: { type: String, required: true },
          endTime: { type: String, required: true },
        },
      ],
    },
  ],

  otp: String,
  otpExpire: Date,

  isVerified: {
    type: Boolean,
    default: false,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


//  Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// Generate JWT token
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};


//  Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken;
};


//  Generate OTP for email/phone verification
userSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = crypto.createHash('sha256').update(otp).digest('hex');
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};


module.exports = mongoose.model('User', userSchema);
