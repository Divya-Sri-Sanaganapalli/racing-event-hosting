const model = require('../models/user');
const Event = require('../models/events');
const rsvp = require('../models/rsvp');

exports.index = (req, res)=>{
    res.render('../index');
};

exports.new = (req, res)=>{
    return res.render('./user/new');
};

exports.getUserLogin = (req, res, next)=> {
    return res.render('./user/login');
};

ListOfCategoryNames = function(events){
    var names = undefined;
    events.forEach(element=>{
        var catName =  element.category;
        if(names === undefined){
            names = [];
            names.push(catName);
        }
        else if(names.findIndex(name => name === catName) == -1)
        {
            names.push(catName);
        }
    });
    return names;
}   

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([model.findById(id), Event.find({host: id})]) //Promise.all - passes array of promises
    .then(results=>{
        const [user, events] = results;// lists of the events created by the host
        var categoryNames = ListOfCategoryNames(events);
        var rsvpArrInfo = undefined;
        rsvp.find({userID: id}).populate('eventID', Event)
        .then(rsvpArr =>{
            res.render('./user/profile', {user, events, categoryNames, rsvpArr});
        })
        .catch(err => next(err));
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=> {
        if(err)
            return next(err);
        else 
            res.redirect('/');
    });
};

exports.create = (req, res, next)=>{
    //res.send('Created a new event')
    let user = new model(req.body);//create a new event document
    if(user.email)
    user.email = user.email .toLowerCase(); // convert the email address to lower case
    user.save()//insert the document to the database
    .then(user =>{
        req.flash('success', 'You have successfully registered');
        res.redirect('/users/login')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

exports.login = (req, res, next)=>{
    let email = req.body.email;
    if(email)
    email = email .toLowerCase(); // convert the email address to lower case
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user=>{
        if(!user){
            console.log('wrong email address');
            req.flash('error', 'wrong email address');
            res.redirect('/users/login');
        }else{
            user.comparePassword(password)
            .then(result=>{
                if(result){
                    req.session.user = user._id; 
                    req.session.userName = user.firstName + ' ' + user.lastName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                }else{
                    req.flash('error', 'wrong password!!!');
                    res.redirect('/users/login');
                }
            });
        }
    })
    .catch(err=>next(err));
};
       