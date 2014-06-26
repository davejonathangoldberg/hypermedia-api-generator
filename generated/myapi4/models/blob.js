var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var blobSchema = new Schema({
	id: { type: String, unique: true, required: true },
	length : { type: String, required: true },
		width : { type: String, required: true },
		height : { type: String, required: true },
		cake : {
		name : { type: String, required: true },
		recipe : { type: String, required: true }
		},
	blob_ : [{ type: String, unique: true, required: true }],
	posts_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'blob'});

Blob = mongoose.model('Blob', blobSchema);

module.exports = Blob;