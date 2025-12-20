const SessionService = require("../../session/session.service");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("./catchAsyncError");
const User = require("../../user/user.model");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    // Validate access token
    let session = await SessionService.validateAccessToken(accessToken);

    // Rotate token if expired but refresh token exists
    if (!session && refreshToken) {
        const rotated = await SessionService.rotateAccessToken(refreshToken, req);
        if (!rotated) {
            return next(new ErrorHandler("Session expired. Please login again.", 401));
        }

        session = rotated.session;

        // Set new access token cookie
        res.cookie("access_token", rotated.accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            expires: session.accessExpiresAt,
        });
    }

    if (!session) {
        return next(new ErrorHandler("Invalid or expired access token", 401));
    }

    // Load user with role & permissions
    req.user = await User.findById(session.user._id)
        .populate({
            path: "role",
            populate: { path: "permissions" },
            select: "name key module"
        });

    if (!req.user) {
        return next(new ErrorHandler("User not found", 404));
    }

    next();
});
