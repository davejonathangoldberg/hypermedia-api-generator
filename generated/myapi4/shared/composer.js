module.exports = function Composer(app) {
  
  // REQUIRED LIBRARIES
  var mongoose = require('mongoose');
  var async = require('async');
  var jjv = require('jjv');
  
  // RELATIVE REFERENCES 
  var Models = require('../models');
  var Coredb = require('./coredb.js');
  var Utility = require('./utility.js');
  var Recurser = require('./recurser.js');
  var meta = require('../meta.js');
  
  var models = new Models();
  var coredb = new Coredb(app);
  var utility = new Utility(app);
  var recurser = new Recurser(app);
  
  
  // RETRIEVE COLLECTION
  this.retrieveCollection = function(req, res, next, query, resourceName, resourcePath, parentResourceName, parentPath){
    /*
     *
     *  QUERY PARAMETERS SHOULD BE PREPPED HERE.
     *  -- OFFSET, LIMIT, SELECT, SORT, Q, HIERARCHICAL -- 
     *
     */
    var model = models[resourceName];
    async.waterfall(
      [
        function(callback){ // ANSWERS - DOES THE PARENT PATH EXIST? CHECKS THE WHOLE PARENT PATH INSTEAD OF JUST THE DIRECT PARENT.
          if(parentResourceName !== ''){
            var data = {};
            console.log('parentResourceName: ' + parentResourceName + '\n');
            data.model = models[parentResourceName];
            data.query = {};
            data.query[parentResourceName + '_'] = parentPath;
            coredb.findOneRecord(data, callback);
          } else {
            callback('', { 'instance' : true });
          }
        },
        function(results, callback){ // FINDS CHILD RESOURCES THAT BELONG TO A GIVEN POST. 
          if(results.instance){
            var data = {};
            data.model = model;
            data.query = query;
            data.instance = results.instance;
            coredb.findRecords(data, callback);
          } else {
            return utility.returnNotFound(res);
          }
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else if(!results.instance){
          return utility.returnNotFound(res);
        } else {             
          return utility.renderTemplate(res, results.collection, resourceName,  200, {});
        }
      });
  }
  
  // RETRIEVE INSTANCE
  this.retrieveInstance = function(req, res, query, queryOptions, resourceName){ // PARENT RESOURCES ARE CHECKED IN THE QUERY
    /*
     *
     *  QUERY PARAMETERS SHOULD BE PREPPED HERE.
     *  -- OFFSET, LIMIT, SELECT, SORT, Q, HIERARCHICAL -- 
     *
     */
    query = query || {};
    queryOptions = queryOptions || {};
    async.waterfall(
      [
        function(callback){
          var data = {};
          data.model = models[resourceName];
          data.query = query;
          data.options = queryOptions;
          console.log('data: ' + JSON.stringify(data) + '\n');
          coredb.findOneRecord(data, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else if(!results.instance){
          return utility.returnNotFound(res);
        } else {          
          return utility.renderTemplate(res, [results.instance], resourceName,  200, {});
        }
      });
  }
  
  // RETRIEVE STUB
  this.retrieveStub = function(req, res, next, query, queryOptions, resourceName, stubName){ // PARENT RESOURCES ARE CHECKED IN THE QUERY
    /*
     *
     *  QUERY PARAMETERS SHOULD BE PREPPED HERE.
     *  -- OFFSET, LIMIT, SELECT, SORT, Q, HIERARCHICAL -- 
     *
     */
    query = query || {};
    console.log('retrieveStub Q: ' + JSON.stringify(query) + '\n');
    queryOptions = queryOptions || {};
    async.waterfall(
      [
        function(callback){
          var data = {};
          data.model = models[resourceName];
          data.query = query;
          data.options = queryOptions;
          console.log('data: ' + JSON.stringify(data) + '\n');
          coredb.findOneRecord(data, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else if(!results.instance){
          console.log('results.instance: ' + JSON.stringify(results.instance) + '\n');
          return utility.returnNotFound(res);
        } else {          
          console.log('results.instance: ' + JSON.stringify([results.instance]) + '\n');
          var stub = results.instance.stubs_[0];
          return utility.renderTemplate(res, [stub], resourceName + stubName,  200, {});
        }
      });
  }
  
  // CREATE INSTANCE
  this.createInstance = function(req, res, next, body, resourceName){ // ONLY FOR TOP LEVEL RESOURCES
    body.id = utility.createInstanceId(); // GENERATE ID
    body.createdDate = new Date();
    body.modifiedDate = new Date();
    var model = models[resourceName];
    async.waterfall(
      [
        function(callback){
          var data = {};
          data.resourceName = resourceName;
          data.body = body;
          utility.validateInputData(data, callback);
        },
        function(validationResult, callback){
          if(validationResult.validated){
            var data = {};
            body.createdDate = new Date();
            body.modifiedDate = new Date();
            data.model = model;
            data.body = body;
            data.body[resourceName + '_'] = body.id;
            console.log('data: ' + JSON.stringify(data) + '\n');
            coredb.insertItem(data, callback);
          } else {
            return next();
          }
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          console.log('results: ' + JSON.stringify(results) + '\n');
          return utility.renderTemplate(res, [results.newInstance], resourceName,  201, {'Location' : 'http://localhost:5000'});
        }
      });
  }
  
  // CREATE CHILD INSTANCE
  this.createChildInstance = function(req, res, next, body, resourceName, parentResourceName, parentPath){
    body.id = utility.createInstanceId(); // GENERATE ID
    var resourcePath = body.id;
    console.log('parentResourceName: ' + parentResourceName + '\n');
    if(parentResourceName == ''){
      resourcePath = body.id;
    } else {
      resourcePath = parentPath + '|' + body.id;
    }
    var model = models[resourceName];
    var parentModel = models[parentResourceName];
    async.waterfall(
      [
        function(callback){
          var data = {};
          data.resourceName = resourceName;
          data.body = body;
          utility.validateInputData(data, callback);
        },
        function(results, callback){ 
          if (parentResourceName == ''){
            console.log('no parent model\n');
            callback(null,true);
          } else if (results.validated){
            var data = {};
            data.model = parentModel;
            data.query = {};
            data.query[parentResourceName + '_'] = parentPath;
            coredb.findOneRecord(data, callback);
          } else {
            return next();
          }
        },
        function(results, callback){
          if(parentResourceName == '' || results.instance){ // CHECKS PARENT PATH. IF DOESN'T EXIST THEN 404, ELSE CREATE NEW RESOURCE. 
            body.createdDate = new Date();
            body.modifiedDate = new Date();
            var data = {};
            data.model = model;
            data.body = body;
            if (parentResourceName != ''){
              data.body[parentResourceName + '_'] = parentPath;  
            }
            data.body[resourceName + '_'] = resourcePath;
            console.log('data: ' + JSON.stringify(data) + '\n');
            coredb.insertItem(data, callback);  
          } else {
            return utility.returnNotFound(res);
          }
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          console.log('create results: ' + JSON.stringify(results) + '\n');
          return utility.renderTemplate(res, [results.newInstance], resourceName,  201, {'Location' : 'http://localhost:5000'});
        }
      });
  }
  
  // DELETE INSTANCE
  this.deleteInstance = function(req, res, resourceName){
    var model = models[resourceName];
    async.series(
      [
        function(callback){
          if (meta[resourceName].childResources.length > 0) {
            var data = [];
            var query = {};
            query[resourceName] = req.params[resourceName + 'InstanceId'];
            var updateQuery = { '$pull' : query };
            for (var i = 0; i < meta[resourceName].childResources.length; i++){
              data[i] = {};
              var childResource = meta[resourceName].childResources[i];
              data[i].model = models[childResource];
              data[i].query = query;
              data[i].updateQuery = updateQuery;
              data[i].options = { 'multi' : true };
            } 
            async.each(data, coredb.updateRecords, function(err){
              if( err ) {
                console.log('A document failed to update.');
                console.log(JSON.stringify(err));
                callback(err, '');
              } else {
                console.log('All documents have been processed successfully');
                data.update = true;
                callback(null, data);
              }
            });
          } else {
            var data = {};
            data.update = false;
            callback(null, data);
          }
        },
        function(callback){
            var data = {};
            data.model = model;
            data.instanceId = req.params[resourceName + 'InstanceId'];
            coredb.deleteItemVar(data, callback);
        }
      ],
      // optional callback
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          return utility.returnServerError(res);  
        } else if (results[1].deleted) {
          console.log('success\n');
          return utility.renderTemplate(res, '', resourceName, 204, {});
        } else {
          return utility.returnServerError(res);
        }
      }); 
  }
  
  // UPDATE INSTANCE
  this.updateInstance = function(req, res, next, resourceName, options){
    var model = models[resourceName];
    req.body.id = req.params[resourceName + 'InstanceId'];
    async.series(
      [
        function(callback){
          var data = {};
          data.resourceName = resourceName;
          data.body = req.body;
          utility.validateInputData(data, callback);
        },
        function(callback){ // NEEDS TO CHECK IF IT IS AN UPDATE OR INSERT FIRST
          var data = {};
          data.model = model;
          data.query = { 'id' : req.body.id };
          req.body.modifiedDate = new Date();
          data.updateQuery = req.body;
          data.options = options;
          coredb.updateRecords(data, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + err + '\n');
          return utility.returnServerError(res);  
        } else {
          console.log('updated data: ' + JSON.stringify(results) + '\n');
          if ( results[0].validated == false ) {
            return utility.returnNotFound(res);
          } else if (results[1].updateInfo.updatedExisting == false && options.upsert){
            return utility.renderTemplate(res, [results[0].body], resourceName, 201, {'Location' : 'http://localhost:5000'});
          } else if (results[1].updateInfo.updatedExisting == false && !options.upsert){
            return utility.returnNotFound(res);
          } else {
            return utility.renderTemplate(res, [results[0].body], resourceName, 200, {});  
          }
        }
      }); 
  }
  
  // UPDATE CHILD INSTANCE
  this.updateChildInstance = function(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options){    
    options.upsert = options.upsert || false;
    async.waterfall(
      [
        function(callback){
          req.body.id = req.params[resourceName + 'InstanceId'];
          var data = {};
          data.body = req.body;
          data.resourceName = resourceName;
          utility.validateInputData(data, callback);
        },
        function(results, callback){ // ANSWERS - DOES THE PARENT PATH EXIST? CHECKS THE WHOLE PARENT PATH INSTEAD OF JUST THE DIRECT PARENT.
          if(results.validated && parentPath !== ''){
            var data = {};
            data.model = models[parentResourceName];
            data.query = {};
            data.query[parentResourceName + '_'] = parentPath;
            coredb.findOneRecord(data, callback);
          } else if (results.validated) {
            callback(null,{"instance" : true});
          } else {
            return next();
          }
        },
        function(results, callback){ // IF THE PARENT PATH EXISTS, DOES THE SPECIFIED CHILD RESOURCE EXIST?
          if(results.instance){
            var data = {};
            data.model = models[resourceName];
            data.query = {};
            data.query['id'] = req.params[resourceName + 'InstanceId'];
            console.log('data: ' + JSON.stringify(data) + '\n');
            console.log('resourceName: ' + resourceName + '\n');
            coredb.findOneRecord(data, callback);
          } else {
            return utility.returnNotFound(res); // RETURNS 404 IF THE PARENT PATH DOESN'T EXIST FROM PREVIOUS FUNCTION BLOCK.
          }
        },
        function(results, callback){ // UPDATES EXISTING RESOURCE, OR IF OPTION UPSERT IS SET TO TRUE, INSERTS NEW RESOURCE WITH A NEW PARENT RESOURCES STRING.
          var data = {}
          data.model = models[resourceName];
          data.resource = results;
          data.query = {};
          data.options = options;
          console.log('results: ' + JSON.stringify(results) + '\n');
          var parentArray = ((parentPath !== '') && results.instance) ? results.instance[parentResourceName + '_'] : [];
          if(results.instance && data.options.upsert && (parentArray.indexOf(parentPath) === -1 ) && (parentPath !== '')) { // IF THE CHILD RESOURCE EXISTS BUT NOT UNDER PARENT PATH, INSERT IT .
            var pushQuery = {};
            if(parentPath !== ''){
              pushQuery[parentResourceName + '_'] = parentPath;
            }
            pushQuery[resourceName + '_'] = resourcePath;
            data.statusCode = 200;
            data.headerObject = {};
            data.query['id'] = req.params[resourceName + 'InstanceId'];
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            data.updateQuery['$set'] = req.body; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT
            data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
          } else if(results.instance) { // RESOURCE EXISTS UNDER THE PARENT PATH
            console.log('just results.instance');
            data.statusCode = 200;
            data.headerObject = {};
            data.query['id'] = req.params[resourceName + 'InstanceId'];
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            data.updateQuery['$set'] = req.body; // CORE RESOURCE INFORMATON TO UPDATE
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
          } else if(data.options.upsert){ // IF THE CHILD RESOURCE DOESN'T EXIST, BUT UPSERT == TRUE, THEN INSERT IT
            if(parentPath !== ''){
              req.body[parentResourceName + '_'] = [ parentPath ] ; // ADD THE PARENT PATH TO AN ARRAY FIELD IN THE BODY OBJECT REPRESENTING AN ARRAY OF PARENT PATHS
            }
            req.body[resourceName + '_'] = [ resourcePath ];
            data.statusCode = 201;
            data.headerObject = { 'Location' : 'http://localhost:5000' };
            data.query['id'] = req.params[resourceName + 'InstanceId'];
            data.updateQuery = {};
            console.log('id: ' + req.body.id);
            req.body.createdDate = new Date();
            req.body.modifiedDate = new Date();
            data.updateQuery['$set'] = req.body; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
          } else { // THE CHILD RESOURCE DOESN'T EXIST AND CAN'T INSERT IT
            callback(null, { 'updatedRecord' : false }); // CALLBACK SHOULD RESULT IN A 404
            //callback('The child resource does not exist and cannot be inserted', ''); // CALLBACK SHOULD RESULT IN AN ERROR
          }
        }
      ],
      function (err, result) {
        console.log('final result: ' + JSON.stringify(result) + '\n');
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
          return utility.returnServerError(res);   
        } else if(!result.updatedRecord) {
          return utility.returnNotFound(res);
        } else {
          return utility.renderTemplate(res, [result.updatedRecord], resourceName, result.statusCode, result.headerObject);
        }
      });
  }
  
  // UPDATE STUB RESOURCE
  this.updateStubResource = function(req, res, next, stubName, resourceName, resourcePath, parentResourceName, parentPath, options){    
    console.log('options: ' + JSON.stringify(options) + '\n');
    options.upsert = options.upsert || false;
    var stubPath = resourcePath + '|' + stubName;
    console.log('stubPath: ' + stubPath + '\n');
    async.waterfall(
      [
        function(callback){
          //req.body.id = req.params[resourceName + 'InstanceId']; // DON'T NEED ID FOR A NAMED STUB
          var data = {};
          data.body = req.body;
          data.resourceName = resourceName + stubName;
          utility.validateInputData(data, callback);
        },
        function(results, callback){ // ANSWERS - DOES THE STUB EXIST WITHIN THE PARENT PATH? CHECKS THE WHOLE PARENT PATH INSTEAD OF JUST THE DIRECT PARENT.
          if(results.validated){
            var data = {};
            data.model = models[resourceName];
            data.query = {};
            data.query[resourceName + '_'] = resourcePath;
            data.query['stubs_'] = { $elemMatch: { 'alias_' : stubName } };
            console.log('data.query: ' + JSON.stringify(data.query) + '\n');
            coredb.findOneRecord(data, callback);
          } else {
            return next();
          }
        },
        function(results, callback){ // UPDATES EXISTING RESOURCE, OR IF OPTION UPSERT IS SET TO TRUE, INSERTS NEW RESOURCE WITH A NEW PARENT RESOURCES STRING.
          var data = {}
          data.model = models[resourceName];
          data.resource = results;
          data.query = {};
          data.options = options;
          if(results.instance) { // IF THE CHILD RESOURCE EXISTS.
            var pushQuery = {};
            data.statusCode = 200;
            data.headerObject = {};
            data.query[resourceName + '_'] = resourcePath;
            data.query['stubs_'] = { $elemMatch: { 'alias_' : stubName } };
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            req.body.alias_ = stubName;
            data.updateQuery['$set'] = { 'stubs_.$' : req.body }; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
          } else if(!results.instance && data.options.upsert) { // RESOURCE EXISTS UNDER THE PARENT PATH
            data.statusCode = 201;
            data.headerObject = {};
            data.query['id'] = req.params[resourceName + 'InstanceId'];
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            req.body.createdDate = new Date();
            req.body.alias_ = stubName;
            console.log('stubPath: ' + stubPath + '\n');
            req.body.stub_ = stubPath;
            data.updateQuery['$set'] = { 'stubs_' : [ req.body ] }; // CORE RESOURCE INFORMATON TO UPDATE
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
          } else if(!results.instance && !data.options.upsert){ // IF THE STUB RESOURCE DOESN'T EXIST, AND UPSERT IS FALSE THEN NEXT()
            return next();
          } else { // THE CHILD RESOURCE DOESN'T EXIST AND CAN'T INSERT IT
            callback('err', ''); // CALLBACK SHOULD RESULT IN AN ERROR
          }
        }
      ],
      function (err, result) {
        if (err) {
          console.log('err: ' + err + '\n');
          return utility.returnServerError(res);   
        }
        var stub = result.updatedRecord.stubs_[0];
        return utility.renderTemplate(res, [stub], resourceName + stubName, result.statusCode, result.headerObject);
      });
  }
  
  // REMOVE HIERARCHICAL ASSOCIATION
  this.removeChildInstances = function(req, res, resourceName, resourcePath, parentResourceName, parentPath, resourcePathRegex){    
    var findQuery = {};
    var pullQuery = {};
    findQuery['id'] = req.params[resourceName + 'InstanceId'];
    findQuery[parentResourceName + '_' ] = parentPath;
    pullQuery[parentResourceName + '_' ] = parentPath;
    async.series(
      [
        function(callback){
          var data = {};
          data.pathRegexToRemove = resourcePathRegex;
          data.resourceName = resourceName;
          data.parentResourceName = parentResourceName;
          data.coredb = coredb;
          recurser.removeAssociations(data, callback);
        },
        function(callback){
          var data = {};
          data.options = {};
          data.updateQuery = {};
          data.model = models[resourceName];
          data.query = findQuery;
          data.updateQuery['$pull'] = pullQuery;
          coredb.findAndUpdateRecords(data, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          console.log('Final Results Updated Record -- TRUE: ' + JSON.stringify(results) + '\n');
          return utility.renderTemplate(res, [results.updatedRecord], resourceName,  204, {});
        }
      });
    
    
  }
  
}