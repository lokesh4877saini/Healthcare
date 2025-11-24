const sendToken = (user, statusCode, res, options = {}) => {
    const token = user.generateJWT();
    const isProduction = process.env.NODE_ENV === "production";
    const userData = user.toObject();
    if (options.excludeFields) {
        options.excludeFields.forEach(field => delete userData[field]);
    }
    const baseOptions = {
        httpOnly: true,
        secure: isProduction ? true : false,  
        sameSite: isProduction ? "none" : "lax", 
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    };

    //  store user role name
    const roleOptions = {
        httpOnly: false,
        ...baseOptions
    };
    const tokenOptions ={
        httpOnly: true,
        ...baseOptions
    }
    // Extract role name
    const roleName = user.role?.name || "unknown";

    // Set cookies
    res
      .cookie("token", token, tokenOptions)
      .cookie("role", roleName, roleOptions)
      .status(statusCode)
      .json({
          success: true,
          user: userData,
          token,
      });
};

module.exports = sendToken;