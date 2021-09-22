const rateLimit = require("express-rate-limit");

// Login request an user can send in a given time window
exports .logInLimiter = rateLimit({
    windowMS: 60 * 1000, // 1 minute time window
    max: 5,  // no of requests. if it exceeds more than 5 then below message is displayed
   // message: 'Too many login requests. Try again later'
    handler: (req, res, next) =>{
        let err = new Error('Too many login requests. Try again later');
        err.status = 429;
        return next(err);
    }
}); 




