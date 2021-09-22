const Event = require('../models/events');

// Checks if the user is guest or logged in
exports.isGuest = (req, res, next) => {
    if(!req.session.user){ // if the user is not logged in i.e guest user 
        return next();
    }
else{
        req.flash('error', 'You are logged in already');
        return res.redirect('/users/profile');
     }
};

// check if user is authenticated

exports.isLoggedIn = (req, res, next) =>{
    if(req.session.user){ // if the user is  logged in then return next middleware function
        return next();
}
else{
        req.flash('error', 'You need to first log in');
        return res.redirect('/users/login');
     }
};

// check if the user is the author of the event

exports.isHost = (req, res, next) => {
    let id = req.params.id;
    Event.findById(id)
    .then(event => {
        if(event.host == req.session.user) {
            return next();
        }
        else{
            let err = new Error(" Unauthorized to access the resource");
            err.status = 401;
            return next(err);
        }
    })
    .catch(err => next(err));
};