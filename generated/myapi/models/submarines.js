var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var submarinesSchema = new mongoose.Schema({
      id: { type: String, unique: true, required: true},
      length: { type: String, required: true},
      width: { type: String, required: true},
      height: { type: String, required: true},
      submarines_: [{type: String, required: true}],
      posts_: [ { type : String, unique : true, required : false } ],
      createdDate: { type: Date, required: true},
      modifiedDate: { type: Date, required: true}
});

Submarines = mongoose.model('Submarines', submarinesSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Submarines;