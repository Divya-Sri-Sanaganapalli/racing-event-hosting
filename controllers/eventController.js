//model require
const session = require('express-session');
const model = require("../models/events");
const rsvp = require("../models/rsvp");
const user = require('../models/user');
// shows all the events

// categories
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

exports.connections = (req,res, next) => {
    model.find()
    .then(events=>
        {
            var categoryNames = ListOfCategoryNames(events);
            res.render("./event/connections", {events, categoryNames})
        })    
    .catch(err=>next(err));
    };
    //res.send("Show all the events - connections page");   
// Start a new event button -> creating new form
exports.new = (req,res,next) =>{
    res.render("./event/newConnection");
};

// create (post) the new event
exports.create = (req,res,next) => {
    //res.send("Created the event");
    let event = new model(req.body); //create a new event document
    event.host = req.session.user; // Current user's ID in the session. login user can create events.
    event.save() //insert the document to the database
    .then(event=>{
        req.flash('success', 'Event created successfully');
        res.redirect('/events')
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status = 400;
            req.flash('error', err.message); 
            res.redirect('back');
        }
        //console.log(err);
            next(err);
    });
};
// each event details 
exports.detail = (req,res,next) => {
    let id = req.params.id;
    /*
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error ("Invalid event id");
        err.status = 400;
        return  next(err);
        }
    */
    model.findById(id).populate('host', user)
    .then(event=>{
        if(event){
        let rsvpSize = 0;
        rsvp.find({eventID: id, status: "YES"})
        .then(rsvpEvents=>{
            if(rsvpEvents) rsvpSize = rsvpEvents.length;
                res.render('./event/connection', {event, rsvpSize});
        })
        .catch(err => next(err));
    }
    else{
        let err = new Error ("Cannot find a event with id " +id);
        err.status = 404;
        next(err);

    }  
    })
    .catch(err=> next(err));
};
//Calling Edit page to edit the event detail
exports.edit = (req,res,next) => {
    //res.send("send the edit form");
    let id = req.params.id;
    /*
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error ("Invalid event id");
        err.status = 400;
        return  next(err);
        }
    */
    //console.log(id);
    model.findById(id)
    .then(event=>{
        if(event){
        res.render('./event/edit',{event});
    } else{
        let err = new Error ("Cannot find a event with id " + id);
        err.status = 404;
        next(err);
        //console.log(err);
    }
    })
    .catch(err=>next(err));
};

//Update the event details

exports.update = (req,res,next) => {
    let event = req.body;
    let id = req.params.id;
    /*
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error ("Invalid event id");
        err.status = 400;
        return  next(err);
        }
    */
    model.findByIdAndUpdate(id, event, {useFindAndModify: false, runValidators: true})
    .then(event=>{
        if(event){
        req.flash('success', 'Event updated successfully');
        res.redirect('/events/'+id);
   } else {
        let err = new Error('Cannot find a event with id ' + id);
        err.status = 404;
        next(err);
   }
})
    .catch(err=>{
    if(err.name === 'ValidationError'){
        err.status = 400;
        req.flash('error', err.message); 
        res.redirect('back');
    }
    //console.log(err);
        next(err);
    });
};

// delete the event

exports.delete = (req, res, next)=>{
    let id = req.params.id;
    /*
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error ("Invalid event id");
        err.status = 400;
        return  next(err);
        }
    */
    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(event=>{
        if(event){
            rsvp.deleteMany({eventID: id})
            .then(eventInfo=>{
                req.flash('success', 'Event deleted successfully');
                return res.redirect('/events');
            })
            .catch(err => next(err));
        }
    else {
        let err = new Error('Cannot find a event with id ' + id);
        err.status = 404;
        next(err);
    }
    })
    .catch(err=>next(err));
};


exports.rsvp_create = (req, res, next) =>{
    let status = req.body.status.toUpperCase();
    let id = req.params.id;
    rsvp.find({eventID: id, userID: req.session.user})
    .then(rsvpInfo =>{
        if(rsvpInfo.length == 1)
        {
            rsvpInfo[0].status = status;
            rsvp.findByIdAndUpdate(rsvpInfo[0]._id, rsvpInfo[0], {useFindAndModify: false, runValidators: true})
            .then(rsvpObj =>{
                if(rsvpObj){
                    req.flash('success','Successfully updated RVSP for this event')
                    res.redirect('/users/profile');
                }
                else{
                    let err = new Error("Sorry, Unable to update RSVP for this event")
                    err.status = 404;
                    nect(err);
                }
            })
            .catch(err => next(err));
        }
        else{
            let rsvpObj = new rsvp();
            rsvpObj.status = status;
            rsvpObj.userID = req.session.user;
            rsvpObj.eventID = req.params.id;
            rsvpObj.save()
            .then(rsvpInfo =>{
                req.flash('success', 'Successfully created RSVP for this event')
                res.redirect('/users/profile');
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
};

exports.rsvp_delete = (req, res, next) => {
    let id = req.params.id;
    rsvp.deleteOne({eventID: id, userID: req.session.user})
    .then(rsvpInfo=>{
        if(rsvpInfo)
        {
            req.flash("success","RSVP deleted successfully")
            res.redirect('/users/profile');
        }
    })
    .catch(err => next(err));
}