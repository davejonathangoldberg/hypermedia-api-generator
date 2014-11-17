var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var email_addressesSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"emailAddress" : { type: String, required: true },
		
	"email_addresses_" : [{ type: String, unique: true, required: true }],
	"speakers_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'email_addresses'});

Email_addresses = mongoose.model('Email_addresses', email_addressesSchema);

module.exports = Email_addresses;