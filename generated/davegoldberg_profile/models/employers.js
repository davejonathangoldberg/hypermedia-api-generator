var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var employersSchema = new Schema({
	id: { type: String, unique: true, required: true },
	employerName : { type: String, required: true },
		location : { type: String, required: true },
		title : { type: String, required: true },
		startYear : { type: String, required: true },
		endYear : { type: String, required: true },
		
	employers_ : [{ type: String, unique: true, required: true }],
	friends_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'employers'});

Employers = mongoose.model('Employers', employersSchema);

module.exports = Employers;