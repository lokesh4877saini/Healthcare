// Create Token and Saving in cookie
const sendToken = (user, statusCode, res, options = {}) => {
    const token = user.generateJWT();
    const isProduction = process.env.NODE_ENV === "production";
    const userData = user.toObject();
    if (options.excludeFields) {
        options.excludeFields.forEach(field => delete userData[field]);
    }
    const tokenOptions = {
        httpOnly: true,
        secure: isProduction ? true : false,   //  don’t force secure in dev
        sameSite: isProduction ? "none" : "lax", // lax works for same-origin dev
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    };

    res.cookie("token", token, tokenOptions).status(statusCode).json({
        success: true,
        userData,
        token,
    })
}
module.exports = sendToken;