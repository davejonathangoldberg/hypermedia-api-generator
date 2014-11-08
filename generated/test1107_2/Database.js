// Database.js
module.exports = function Database(configuration) {
  var mongoose = require('mongoose');
  var mongooseUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL || 'mongodb://' + 
  configuration.host + configuration.database;
  console.log('mongooseURI = ' + mongooseUri);
  mongoose.connect(mongooseUri);
};