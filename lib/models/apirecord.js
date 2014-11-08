var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var apiRecordSchema = new Schema({
	"id" : { type: String, unique: true, required: false },
	"name" : { type: String, required: false },
	"status" : { type: String, required: false },
	"webhookUrl" : { type: String, required: false },
	"swaggerUrl" : { type: String, required: false },
	"productionUrl" : { type: String, required: false },
	"herokuAppName" : { type: String, required: false },
	"input" : Schema.Types.Mixed,
	"transformed" : Schema.Types.Mixed,
	"swagger" : Schema.Types.Mixed,
	"createdDate" : { type: Date, required: false },
	"modifiedDate" : { type: Date, required: false }
}, { collection: 'APIRecords'});

APIRecords = mongoose.model('APIRecords', apiRecordSchema);

module.exports = APIRecords;