var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var widgetsSchema = new Schema({
	id: { type: String, unique: true, required: true },
	color : { type: String, required: true },
		speed : { type: String, required: true },
		size : { type: String, required: true },
		
	widgets_ : [{ type: String, unique: true, required: true }],
	submarines_ : [{ type: String, unique: true, required: true }],
	createdDate: { type: Date, required: true },
	modifiedDate: { type: Date, required: true }
}, { collection: 'widgets'});

Widgets = mongoose.model('Widgets', widgetsSchema);

module.exports = Widgets;