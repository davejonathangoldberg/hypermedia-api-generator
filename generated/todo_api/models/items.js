var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var itemsSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"description" : { type: String, required: true },
		"priority" : { type: String, required: true },
		"dueDate" : { type: String, required: true },
		
	"items_" : [{ type: String, unique: true, required: true }],
	"projects_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'items'});

Items = mongoose.model('Items', itemsSchema);

module.exports = Items;