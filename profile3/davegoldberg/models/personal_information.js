var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var personal_informationSchema = new Schema({
	id: { type: String, unique: true, required: true },
	firstName : { type: String, required: true },
		lastName : { type: String, required: true },
		emailAddress : { type: String, required: true },
		phoneNumber : { type: String, required: true },
		
	personal_information_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'personal_information'});

Personal_information = mongoose.model('Personal_information', personal_informationSchema);

module.exports = Personal_information;