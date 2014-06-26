var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var tagsSchema = new mongoose.Schema({
      id: { type: String, unique: true, required: true},
      tags_: [{type: String, required: true}],
      posts_: [ { type : String, unique : true, required : false } ],
      createdDate: { type: Date, required: true},
      modifiedDate: { type: Date, required: true}
});

Tags = mongoose.model('Tags', tagsSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Tags;