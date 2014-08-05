var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var friendsSchema = new Schema({
	id: { type: String, unique: true, required: true },
	firstName : { type: String, required: true },
		lastName : { type: String, required: true },
		
	friends_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'friends'});

Friends = mongoose.model('Friends', friendsSchema);

module.exports = Friends;