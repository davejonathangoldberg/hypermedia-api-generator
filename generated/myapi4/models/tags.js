var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var tagsSchema = new Schema({
	id: { type: String, unique: true, required: true },
	
	tags_ : [{ type: String, unique: true, required: true }],
	posts_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'tags'});

Tags = mongoose.model('Tags', tagsSchema);

module.exports = Tags;