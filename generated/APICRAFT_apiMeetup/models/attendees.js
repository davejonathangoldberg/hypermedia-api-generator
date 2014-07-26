var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var attendeesSchema = new Schema({
	id: { type: String, unique: true, required: true },
	name : { type: String, required: true },
		apiExperience : { type: String, required: true },
		employer : { type: String, required: true },
		
	attendees_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'attendees'});

Attendees = mongoose.model('Attendees', attendeesSchema);

module.exports = Attendees;