const User = require('../models/user');
const ErrorHandler = require('../utils/ErrorHandler');
require('dotenv').config({ path: "back/config/config.env" })
// const path = require('path');
// const fs= require('fs');
// const ejs = require('ejs');
const catchAsyncErrors = require('../middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// Register a new User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password, role, specialization, phone } = req.body;
    const user = await User.create({
        name, email, password, role, specialization, phone
    });
    sendToken(user, 201, res)
}
)
exports.loginUser = catchAsyncErrors(
    async (req, res, next) => {
        const { email, password } = req.body;
        //ckecking )if user has given password and email both
        if (!email || !password) {
            return next(new ErrorHandler("Please Enter Email & Password", 400));
        }
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return next(new ErrorHandler("Invalid Email & Password", 401));
        }
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Email & Password", 401));
        }
        sendToken(user, 200, res);
    }
)
// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged Out",
    })
}
)
// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    // Get ResetPassword token
    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${process.env.FRONTEND_URL}password/reset/${resetToken}`;
    const message = `Your Password reset token is: 🔗<br/><br/>
    <a href="${resetPasswordUrl}">${resetPasswordUrl}</a><br/><br/>`;
    try {
        await sendEmail({
            email: user.email,
            name: user.name,
            subject: "Password Recovery",
            resetpasswordurl: resetPasswordUrl,
            message: message
        });
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        })
    } catch (e) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(e.message, 500));

    }
})
// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // createing token hash
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }
    })
    if (!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res)

})



// Get user Details

exports.getUserDetails = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json({
            success: true,
            user,
        });
    }
)
// update user password
exports.updatePassword = catchAsyncErrors(
    async (req, res, next) => {
        const user = await User.findById(req.user.id).select("+password");
        const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
        if (!isPasswordMatch) {
            return next(new ErrorHandler("old Password is incorrect", 400));
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new ErrorHandler("Password doesn't match", 400));
        }
        user.password = req.body.newPassword;
        await user.save();
        sendToken(user, 200, res)
    }
)
//update user Profile

exports.updateProfile = catchAsyncErrors(
    async (req, res, next) => {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
        }
        const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })
        res.status(200).json({
            success: true,
        })
    }
)