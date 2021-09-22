const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    category: {type: String,required: [true, 'category is required']},
    event_title: {type: String,required: [true, 'title is required']},
    Date: {type: String,required: [true, 'Date is required']},
    //date_validate: [dateValidator, "Date must be greater than today's date"]},
    start_time: {type: String,required: [true, 'Start_time is required']},
    end_time: {type: String,required: [true, 'end_time is required']},
    location: {type: String,required: [true, 'location is required']},
    image:{type: String,required: [true, 'Image URL is required']},
    host: {type: Schema.Types.ObjectId, ref:"User"}, // Mongoose knows that it should locate ObjectId in User collection 
    Description: {type: String,required: [true, 'Event Description is required'],
          minLength: [10,'the content should have atleast 10 characters']}
});

/** date_validator

function dateValidator(value) {
    return this.Date >= Date.now();
}

**/
// collection name is events in the database
module.exports = mongoose.model('Event', eventSchema);












