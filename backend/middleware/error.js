const ErrorHandler = require('../utils/ErrorHandler');
module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500; 
    err.message = err.message || "Internal Server Error"; 
    // wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found .invalid: ${err.path}`
        err = new ErrorHandler(message,400);
    }
    if (err.code === 11000 && err.keyvalue) {
        const duplicateFields = Object.keys(err.keyvalue).join(", ");
        const message = `Duplicate ${duplicateFields} entered.`;
        err = new ErrorHandler(message, 400);
    } 
    // wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is invalid,Try again.`;
        err = new ErrorHandler(message, 400);
    }
    // JWT expire error
    if(err.name === "JsonExpiredError"){
        const message = `Json Web Token is Expired,Try again.`;
        err = new ErrorHandler(message, 400);
    }
    res.status(err.statusCode).json({
        success:false,
        message:err.message,
    })
}