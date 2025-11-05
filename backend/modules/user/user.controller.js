const UserService = require('user/user.service');
const catchAsyncError = require('core/middleware/catchAsyncError');
const ErrorHandler = require('core/utils/ErrorHandler');
const sendToken = require('core/utils/jwtToken');
const sendEmail = require('core/utils/sendEmail');

//  Register user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const user = await UserService.registerUser(req.body);
  sendToken(user, 201, res);
});

//  Login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Please enter both email and password', 400));
  }

  const user = await UserService.loginUser(email, password);
  sendToken(user, 200, res, {
    excludeFields: ['password', 'availableSlots', 'createdAt', 'phone','otp','otpExpire','isVerified'],
  });
});
// Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", null, {
    httpOnly: true,
    secure: isProduction ? true : false,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0), // immediately expire
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});


//  Forgot password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const { user, resetToken } = await UserService.forgotPassword(req.body.email);
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `<p>Reset your password using the link below:</p><a href="${resetUrl}">${resetUrl}</a>`;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message,
  });

  res.status(200).json({
    success: true,
    message: `Password reset email sent to ${user.email}`,
  });
});

//  Reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const user = await UserService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.confirmPassword
  );
  sendToken(user, 200, res);
});

//  Update profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  await UserService.updateProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
  });
});

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const { user } = await UserService.getUserdetails(req.user.id);
  res.status(200).json({
    success: true,
    user
  })
});

//  Delete all users
exports.deleteAllUsers = catchAsyncError(async (req, res, next) => {
  const result = await UserService.deleteAllUsers();
  res.status(200).json({
    success: true,
    message: result.message,
    deletedCount: result.deletedCount,
  });
});
