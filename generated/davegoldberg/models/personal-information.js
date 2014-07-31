var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var personal-informationSchema = new Schema({
	id: { type: String, unique: true, required: true },
	firstName : { type: String, required: true },
		lastName : { type: String, required: true },
		emailAddress : { type: String, required: true },
		phoneNumber : { type: String, required: true },
		
	personal-information_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'personal-information'});

Personal-information = mongoose.model('Personal-information', personal-informationSchema);

module.exports = Personal-information;