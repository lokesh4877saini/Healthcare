const User = require('./user.model');
const ErrorHandler = require('core/utils/ErrorHandler');
const sendEmail = require('core/utils/sendEmail');
const { sendEmailVerification } = require('notification/notification.service');
const crypto = require('crypto');
const createLogger = require('core/logger/withContext');

const logger = createLogger('UserService');

class UserService {
  /** Register a new user */
  static async registerUser({ name, email, password, role, specialization, phone }) {
    logger.info(`Attempting to register new user`, { email, role });

    const user = await User.create({ name, email, password, role, specialization, phone });
    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });

    logger.info(`User registered successfully`, { userId: user._id, email, role });

    // Optionally send verification email
    // await sendEmailVerification(user, otp);
    return user;
  }

  /** Login user */
  static async loginUser(email, password) {
    logger.info(`Login attempt`, { email });

    const user = await User.findOne({ email }).select('+password').populate("role", "name permissions");
    if (!user) {
      logger.warn(`Login failed - user not found`, { email });
      throw new ErrorHandler('Invalid Email or Password', 401);
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      logger.warn(`Login failed - invalid password`, { userId: user._id, email });
      throw new ErrorHandler('Invalid Email or Password', 401);
    }

    logger.info(`User logged in successfully`, { userId: user._id, email });
    return user;
  }

  /** Forgot password */
  static async forgotPassword(email) {
    logger.info(`Forgot password request`, { email });

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Forgot password failed - user not found`, { email });
      throw new ErrorHandler('User not found', 404);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    logger.info(`Password reset token generated`, { userId: user._id, email });
    return { user, resetToken };
  }

  /** Reset password */
  static async resetPassword(token, newPassword, confirmPassword) {
    logger.info(`Password reset attempt`);

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      logger.warn(`Invalid or expired reset token`);
      throw new ErrorHandler('Invalid or expired reset token', 400);
    }

    if (newPassword !== confirmPassword) {
      logger.warn(`Password mismatch for reset`, { userId: user._id });
      throw new ErrorHandler("Passwords don't match", 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    logger.info(`Password reset successful`, { userId: user._id });
    return user;
  }

  /** Update user profile */
  static async updateProfile(userId, data) {
    logger.info(`Updating user profile`, { userId });

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      logger.warn(`Update failed - user not found`, { userId });
      throw new ErrorHandler('User not found', 404);
    }

    logger.info(`User profile updated successfully`, { userId });
    return user;
  }

  /** Get user details */
  static async getUserdetails(userId) {
    logger.info(`Fetching user details`, { userId });

    const user = await User.findById(userId) .populate("role", "name") 
    .select("role");

    if (!user) {
      logger.warn(`User not found`, { userId });
      throw new ErrorHandler('User not found', 404);
    }

    logger.info(`User details fetched successfully`, { userId });
    return user;
  }

  /** Delete all users */
  static async deleteAllUsers() {
    logger.warn(`Deleting all users (admin operation)`);

    const result = await User.deleteMany({});

    logger.info(`All users deleted`, { deletedCount: result.deletedCount });
    return {
      message: 'All users deleted successfully',
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = UserService;
