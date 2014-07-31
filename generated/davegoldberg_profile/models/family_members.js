var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var family_membersSchema = new Schema({
	id: { type: String, unique: true, required: true },
	firstName : { type: String, required: true },
		lastName : { type: String, required: true },
		relationship : { type: String, required: true },
		age : { type: String, required: true },
		
	family_members_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'family_members'});

Family_members = mongoose.model('Family_members', family_membersSchema);

module.exports = Family_members;