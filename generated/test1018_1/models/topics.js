var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var topicsSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"name" : { type: String, required: true },
		"description" : { type: String, required: true },
		
	"topics_" : [{ type: String, unique: true, required: true }],
	"speakers_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'topics'});

Topics = mongoose.model('Topics', topicsSchema);

module.exports = Topics;