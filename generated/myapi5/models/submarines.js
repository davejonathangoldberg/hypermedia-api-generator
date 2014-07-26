var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var submarinesSchema = new Schema({
	id: { type: String, unique: true, required: true },
	length : { type: String, required: true },
		width : { type: String, required: true },
		height : { type: String, required: true },
		
	submarines_ : [{ type: String, unique: true, required: true }],
	posts_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'submarines'});

Submarines = mongoose.model('Submarines', submarinesSchema);

module.exports = Submarines;