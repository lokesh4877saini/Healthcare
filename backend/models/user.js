const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config(); // load .env file variables
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your name"],
        maxLength: [30, "Name can't exceed 30 Characters"],
        minLength: [3, "Name Should have more than 3 Characters"],
    },

    email: {
        type: String,
        required: [true, "Please Enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter your password"],
        minLength: [8, "Password Should have greater than 8 Characters"],
        select: false, // this will disable mongodb find method
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
            date: String,  // e.g. "2025-09-27"
            slots: [       // array of time ranges
                {
                    startTime: { type: String, required: true }, // e.g. "09:00"
                    endTime: { type: String, required: true }    // e.g. "10:00"
                }
            ]
        }
    ],      
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
})
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)

})
// token generation
userSchema.methods.generateJWT = function () {
    const token = JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
    return token
}
// pass word compare 
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
// Generating password reset token
userSchema.methods.getResetPasswordToken = async function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // hashing and adding resetpasswordtoken to userschema
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}
module.exports = mongoose.model("user", userSchema);