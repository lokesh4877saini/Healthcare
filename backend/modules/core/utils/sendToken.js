const SessionService =require("../../session/session.service");

const sendToken = async (user, statusCode, res, req, options = {}) => {
    const sessionData = await SessionService.createSession(user._id, req);
    const { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt } = sessionData;
  
    const isProduction = process.env.NODE_ENV === "production";
  
    // Cookie options
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: accessExpiresAt,
    });
  
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: refreshExpiresAt,
    });
  
    // Role cookie
    const roleName = user.role?.name || "unknown";
    res.cookie("role", roleName, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: refreshExpiresAt,
    });
  
    const userData = user.toObject();
    if (options.excludeFields) {
      options.excludeFields.forEach(field => delete userData[field]);
    }
  
    return res.status(statusCode).json({
      success: true,
      user: userData,
      accessToken,
      refreshToken,
    });
  };
module.exports = sendToken;