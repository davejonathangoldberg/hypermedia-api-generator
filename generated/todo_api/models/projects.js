var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var projectsSchema = new Schema({
	"id" : { type: String, unique: true, required: true },
	"name" : { type: String, required: true },
		"label" : { type: String, required: true },
		"description" : { type: String, required: true },
		
	"projects_" : [{ type: String, unique: true, required: true }],
	"createdDate" : { type: Date, required: true },
	"modifiedDate" : { type: Date, required: true }
}, { collection: 'projects'});

Projects = mongoose.model('Projects', projectsSchema);

module.exports = Projects;