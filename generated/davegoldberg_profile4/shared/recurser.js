// REQUIRED LIBRARIES
var mongoose = require('mongoose');
var async = require('async');
var jjv = require('jjv');

// RELATIVE REFERENCES 
var Models = require('../models');
var Coredb = require('./coredb.js');
var Utility = require('./utility.js');
var meta = require('../meta.js');
var models = new Models();

function recurseRemove (data, callback){    
  var pullQuery = {};
  var regexQuery = {};
  
  regexQuery['$regex'] = data.pathRegexToRemove;
  pullQuery[data.resourceName + '_' ] = regexQuery;
  if(data.parentResourceName !== ''){
    pullQuery[data.parentResourceName + '_' ] = regexQuery;
  }
  async.waterfall(
    [
      function(callback){
        data.updateQuery = {};
        data.query = {};
        data.options = { 'multi' : true };
        data.model = models[data.resourceName];
        data.updateQuery['$pull'] = pullQuery;
        console.log('Second Data Before Update: ' + JSON.stringify(data) + '\n');
        data.coredb.updateRecords(data, callback);
      },
      function(results, callback){
        console.log('First Results Data Before Recursive Each: ' + JSON.stringify(results) + '\n');
        if (meta[results.resourceName].childResources.length > 0) {
          var childData = [];
          for (var i = 0; i < meta[results.resourceName].childResources.length; i++){
            childData[i] = {};
            var childResource = meta[results.resourceName].childResources[i];
            childData[i].pathRegexToRemove = results.pathRegexToRemove;
            childData[i].resourceName = childResource;
            childData[i].parentResourceName = results.resourceName;
            childData[i].coredb = results.coredb;
          }
          async.each(childData, recurseRemove, function(err){
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
              console.log('A document failed to update.');
              console.log(JSON.stringify(err));
              callback(err, '');
            } else {
              console.log('All documents have been processed successfully');
              results.childrenUpdated = true;
              callback(null, results);
            }
          });
        } else {
          console.log('No Children: ' + JSON.stringify(results) + '\n');
          results.noChildren = true;
          callback(null, results);
        }
      }
    ],
    // optional callback
    function(err, results){
      if (err) {
        console.log('err: ' + err + '\n');
        callback(err, results);
      } else {
        console.log('Pop Out Results: ' + JSON.stringify(results) + '\n');
        callback("", results);
      }
    }); 
  
}

module.exports = function Recurser(app) {
  
  var coredb = new Coredb(app);
  var utility = new Utility(app);
  
  // REMOVE HIERARCHICAL ASSOCIATION
  this.removeAssociations = recurseRemove;
  
}