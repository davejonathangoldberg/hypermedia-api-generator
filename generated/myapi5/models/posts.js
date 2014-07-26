var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var postsSchema = new Schema({
	id: { type: String, unique: true, required: true },
	title : { type: String, required: true },
		content : { type: String, required: true },
		author : { type: String, required: true },
		
	posts_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'posts'});

Posts = mongoose.model('Posts', postsSchema);

module.exports = Posts;