var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var widgetsSchema = new mongoose.Schema({
      id: { type: String, unique: true, required: true},
      color: { type: String, required: true},
      speed: { type: String, required: true},
      size: { type: String, required: true},
      widgets_: [{type: String, required: true}],
      submarines_: [ { type : String, unique : true, required : false } ],
      createdDate: { type: Date, required: true},
      modifiedDate: { type: Date, required: true}
});

Widgets = mongoose.model('Widgets', widgetsSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Widgets;