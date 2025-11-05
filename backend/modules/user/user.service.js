const User = require('./user.model');
const ErrorHandler = require('core/utils/ErrorHandler');
const sendEmail = require('core/utils/sendEmail');
const { sendEmailVerification } = require('notification/notification.service');
const crypto = require('crypto');

class UserService {
  /** Register a new user */
  static async registerUser({ name, email, password, role, specialization, phone }) {
    const user = await User.create({ name, email, password, role, specialization, phone });
    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });

    // await sendEmailVerification(user, otp);
    return user;
  }

  /** Login user */
  static async loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new ErrorHandler('Invalid Email or Password', 401);

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) throw new ErrorHandler('Invalid Email or Password', 401);

    return user;
  }

  /** Forgot password */
  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new ErrorHandler('User not found', 404);

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    return { user, resetToken };
  }

  /** Reset password */
  static async resetPassword(token, newPassword, confirmPassword) {
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) throw new ErrorHandler('Invalid or expired reset token', 400);
    if (newPassword !== confirmPassword) {
      throw new ErrorHandler("Passwords don't match", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
  }

  /** Update user profile */
  static async updateProfile(userId, data) {
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new ErrorHandler('User not found', 404);
    return user;
  }

  /** get user details */
  static async getUserdetails(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new ErrorHandler('User not found', 404);
    return user;
  }

  /** Delete all users */
  static async deleteAllUsers() {
    const result = await User.deleteMany({});
    return {
      message: 'All users deleted successfully',
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = UserService;
