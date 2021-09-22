const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rsvpSchema = new Schema({

userID : {type: Schema.Types.ObjectId, ref:"User"},
eventID : {type: Schema.Types.ObjectId, ref:"Event"},
status : {type: String, required: [true, 'status is required']},},);


module.exports = mongoose.model('RSVP', rsvpSchema);

