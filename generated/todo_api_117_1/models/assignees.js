var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var assigneesSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"firstName" : { type: String, required: true },
		"lastName" : { type: String, required: true },
		"emailAddress" : { type: String, required: true },
		
	"assignees_" : [{ type: String, unique: true, required: true }],
	"items_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'assignees'});

Assignees = mongoose.model('Assignees', assigneesSchema);

module.exports = Assignees;