var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var speakersSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"name" : { type: String, required: true },
		"employer" : { type: String, required: true },
		
	"speakers_" : [{ type: String, unique: true, required: true }],
	"topics_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'speakers'});

Speakers = mongoose.model('Speakers', speakersSchema);

module.exports = Speakers;