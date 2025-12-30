const UserService = require('../user/user.service');
const catchAsyncError = require('../core/middleware/catchAsyncError');
const ErrorHandler = require('../core/utils/ErrorHandler');
const sendToken = require('../core/utils/sendToken'); // session-based now
const sendEmail = require('../core/utils/sendEmail');
const SessionService = require('../session/session.service');
const createLogger = require('../core/logger/withContext');

const logger = createLogger('UserController');

// --------------------- Register user ---------------------
exports.registerUser = catchAsyncError(async (req, res, next) => {
  logger.info('Register user request received', { email: req.body.email, role: req.body.role });

  const user = await UserService.registerUser(req.body);

  logger.info('User registered successfully', { userId: user._id, email: user.email });

  // Send session cookies
  await sendToken(user, 201, res, req);
});

// --------------------- Login user ---------------------
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  logger.info('Login request received', { email });

  if (!email || !password) {
    logger.warn('Login attempt with missing credentials');
    return next(new ErrorHandler('Please enter both email and password', 400));
  }

  
  const user = await UserService.loginUser(email, password, req);
  logger.info('User logged in successfully', { userId: user._id, email });
  
  // Send session cookies, exclude sensitive fields
  await sendToken(user, 200, res, req, {
    excludeFields: ['password', 'availableSlots', 'createdAt', 'phone', 'otp', 'otpExpire', 'isVerified'],
  });
});

// --------------------- Logout user ---------------------
exports.logout = catchAsyncError(async (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const refreshToken = req.cookies?.refresh_token;

  logger.info('Logout request received', { userId: req.user?._id });

  // Invalidate session by refresh token
  if (refreshToken) {
    await SessionService.deleteSessionByRefreshToken(refreshToken);
  }

  // Clear cookies
  res
    .cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
    })
    .cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
    })
    .cookie('role', '', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
    });

  logger.info('User logged out successfully');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// --------------------- Forgot password ---------------------
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  logger.info('Forgot password request received', { email: req.body.email });

  const { user, resetToken } = await UserService.forgotPassword(req.body.email);
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `<p>Reset your password using the link below:</p><a href="${resetUrl}">${resetUrl}</a>`;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    message,
  });

  logger.info('Password reset email sent', { userId: user._id, email: user.email });
  res.status(200).json({
    success: true,
    message: `Password reset email sent to ${user.email}`,
  });
});

// --------------------- Reset password ---------------------
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  logger.info('Reset password request received');

  const user = await UserService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.confirmPassword
  );

  logger.info('Password reset successfully', { userId: user._id });

  // Send session cookies after password reset
  await sendToken(user, 200, res, req);
});

// --------------------- Update profile ---------------------
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  logger.info('Profile update request received', { userId: req.user.id });

  await UserService.updateProfile(req.user.id, req.body);

  logger.info('Profile updated successfully', { userId: req.user.id });
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
  });
});

// --------------------- Get user details ---------------------
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  logger.info('Get user details request received', { userId: req.user.id });

  const user = await UserService.getUserdetails(req.user.id);

  logger.info('User details fetched successfully', { userId: req.user.id });
  res.status(200).json({
    success: true,
    user,
  });
});

// --------------------- Delete all users (Admin) ---------------------
exports.deleteAllUsers = catchAsyncError(async (req, res, next) => {
  logger.warn('Admin requested to delete all users');

  const result = await UserService.deleteAllUsers();

  logger.info('All users deleted', { deletedCount: result.deletedCount });
  res.status(200).json({
    success: true,
    message: result.message,
    deletedCount: result.deletedCount,
  });
});
