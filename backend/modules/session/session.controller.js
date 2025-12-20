const SessionService = require("./session.service");

const sendSession = async (user, statusCode, req, res, options = {}) => {
    const sessionToken = await SessionService.createSession(user?._id, req);
    
    const userData = user.toObject();
    if (options.excludeFields) {
        options.excludeFields.forEach(field => delete userData[field]);
    }

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    // role cookie remains readable by frontend
    res.cookie("session_token", sessionToken, cookieOptions)
       .cookie("role", user.role?.name || "unknown", {
            httpOnly: false,
            secure: false
       })
       .status(statusCode)
       .json({
           success: true,
           user: userData,
           sessionToken
       });
};

module.exports = sendSession;
