var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var family-membersSchema = new Schema({
	id: { type: String, unique: true, required: true },
	firstName : { type: String, required: true },
		lastName : { type: String, required: true },
		relationship : { type: String, required: true },
		age : { type: String, required: true },
		
	family-members_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'family-members'});

Family-members = mongoose.model('Family-members', family-membersSchema);

module.exports = Family-members;