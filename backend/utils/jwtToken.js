// Create Token and Saving in cookie
const sendToken = (user, statusCode, res) => {
    const token = user.generateJWT();
    const isProduction = process.env.NODE_ENV === "production";

const options = {
  httpOnly: true,
  secure: isProduction ? true : false,   //  don’t force secure in dev
  sameSite: isProduction ? "none" : "lax", // lax works for same-origin dev
  expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
};

    res.cookie("token", token, options).status(statusCode).json({
        success: true,
        user,
        token,
    })
}
module.exports = sendToken;