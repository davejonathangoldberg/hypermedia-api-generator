var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var detailsSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"location" : { type: String, required: true },
		"time" : { type: Number, required: true },
		
	"details_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'details'});

Details = mongoose.model('Details', detailsSchema);

module.exports = Details;