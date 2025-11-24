const User = require('user/user.model');
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require('core/utils/ErrorHandler');
const JWT = require('jsonwebtoken');
exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login to access this resourse",401));
    }
    const decodedData = JWT.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decodedData.id)
    .populate("role", "name permissions");
  
    next();
})
// middleware/authorizeRoles.js
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
  if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const userRole = req.user.role?.name;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: `Role ${userRole} is not allowed`});
      }
  
      next(); // proceed if role matches
    };
  };
  