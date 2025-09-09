const User = require('../models/user');
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require('../utils/ErrorHandler');
const JWT = require('jsonwebtoken');
exports.isAuthenticatedUser = catchAsyncError(async(req,res,next)=>{
  console.log(req?.cookies);
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login to access this resourse",401));
    }
    const decodedData = JWT.verify(token,process.env.JWT_SECRET)
    req.user = await User.findById(decodedData.id);
    next();
})
// middleware/authorizeRoles.js
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
  if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Role ${req.user.role} is not allowed` });
      }
  
      next(); // proceed if role matches
    };
  };
  