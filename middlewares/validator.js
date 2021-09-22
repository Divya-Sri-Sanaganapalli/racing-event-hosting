const {body} = require('express-validator');
const {validationResult} = require('express-validator');
const { DateTime } = require("luxon");

exports.validateId = (req, res, next)=>{
    let id = req.params.id;
    //an objectId is a 24-bit Hex string
    if(!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    } else {
        return next();
    }
};

exports.validateSignUp = [body('firstName','First Name cannot be empty').notEmpty().trim().escape(),
body('lastName','Last Name cannot be empty').notEmpty().trim().escape(),
body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','password must be atleast 8 characters and atmost 64 characters').isLength({min: 8,max: 64})];

exports.validateLogIn = [body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
body('password','password must be atleast 8 characters and atmost 64 characters').isLength({min: 8,max: 64})];

exports.validateResult = (req,res,next) =>{
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error =>{
            req.flash('error',error.msg);
    });
    return res.redirect('back');
    }
    else{
        return next();
    }
}


exports.validateEvent = [body('category','category cannot be empty').notEmpty().trim().escape(),
body('category','category must be min 3 or more characters ').isLength({min: 3}),
body('event_title','event title cannot be empty').notEmpty().trim().escape(),
body('event_title','event must be min 3 or more characters ').isLength({min: 3}),
body('location','location cannot be empty').notEmpty().trim().escape(),
body('image','image cannot be empty').notEmpty().trim().escape(),
body('Description','Event Description cannot be empty').notEmpty().trim().escape(),
body('Description','Event Description must be minimun 10 characters').isLength({min: 10}),
body('Date','Date cannot be empty').notEmpty(),
body('Date',"Date must be greater than today's date").isAfter(DateTime.now().toFormat('yyyy LL dd')),
body('start_time','start time cannot be empty').notEmpty(),
body('end_time','end time cannot be empty').notEmpty(),
body('end_time').custom((value, {req})=>{
    console.log("Start Time"+req.body.start_time);    
    console.log("end Time"+req.body.end_time);    
    if (req.body.end_time <= req.body.start_time){
            throw new Error('End Time should be greater than Start Time');
        }

        else return true;
    })
]

