module.exports = function Composer(app) {
  
  // REQUIRED LIBRARIES
  var async = require('async');
  
  // RELATIVE REFERENCES
  var Coredb = require('./coredb.js');
  var Models = require('./models');
  
  var coredb = new Coredb(app);
  var models = new Models();
  
  
  this.retrieveApi = function(data, callback){ 
    var record = {};
    record['model'] = models['apiRecord'];
    record['query'] = {};
    record['query'][data.queryKey] = data.queryValue;
    record['options'] = data.queryOptions || {};
    coredb.findOneRecord(record, callback);
  }
  
  // CREATE API RECORD
  this.saveApi = function(data, callback){
    var record = {};
    var apiId = Math.random().toString(36).slice(2);
    record['model'] = models['apiRecord'];
    record['id'] = apiId;
    record['name'] = data['apiOptions']['apiName'];
    record['status'] = 'pending';
    record['input'] = data;
    record['createdDate'] = new Date();
    record['modifiedDate'] = new Date();
    coredb.insertItem(record, callback);
  }
  
  // UPDATE API RECORD
  this.updateApi = function(data, callback){
    var record = {};
    record['query'] = {};
    record['updateQuery'] = {};
    record['query'][data.queryKey] = data.queryValue;
    record['updateQuery']['$set'] = data.updateObject;
    record['model'] = models['apiRecord'];
    record['options'] = { "upsert" : false };
    coredb.findAndUpdateRecords(record, callback); // UPDATE THE CHILD RESOURCE
  }
  
  // UPDATE API RECORD
  this.updateFunctionApi = function(data, callback){
    var record = {};
    record['query'] = {};
    record['updateQuery'] = {};
    record['query'][data.queryKey] = data.queryValue;
    record['updateQuery']['$set'] = data.updateObject;
    record['model'] = models['apiRecord'];
    record['options'] = { "upsert" : false };
    coredb.updateRecords(record, callback); // UPDATE THE CHILD RESOURCE
  }
  
}