var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var postsSchema = new mongoose.Schema({
      id: { type: String, unique: true, required: true},
      title: { type: String, required: true},
      content: { type: String, required: true},
      author: { type: String, required: true},
      posts_: [{type: String, required: true}],
      createdDate: { type: Date, required: true},
      modifiedDate: { type: Date, required: true}
});

Posts = mongoose.model('Posts', postsSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Posts;