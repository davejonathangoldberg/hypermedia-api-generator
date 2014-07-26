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
        function(results, callback){ // FINDS AND RETURNS THE COLLECTION BEING QUERIED 
          if(results.instance){
            var data = {};
            data.model = model;
            data.query = query;
            data.instance = results.instance;
            coredb.findRecords(data, callback);
          } else {
            return utility.returnNotFound(res);
          }
        },
        function(results, callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          if (!results.instance){
            return utility.returnNotFound(res); // RETURNS 404 ERROR
          } else {
            results.parent = parentResourceName;
            results.path = req.path;
            results.resourceName = resourceName;
            results.resourceType = 'collection';
            results.req = req;
            return utility.hypermediaStage(results, callback);
          }
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {
          console.log('results.collection: ' + JSON.stringify(results) + '\n');
          console.log('results.mediaType: ' + JSON.stringify(results.mediaType) + '\n');
          console.log('req.path: ' + JSON.stringify(req.path) + '\n');
          console.log('req.url: ' + JSON.stringify(req.url) + '\n');
          return utility.renderTemplate(res, results, resourceName,  200, {});
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
        },
        function(results, callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          if (!results.instance){
            return utility.returnNotFound(res); // RETURNS 404 ERROR
          } else {
            console.log('instance results: ' + JSON.stringify(results) + '\n');
            results.parent = 'instance';
            results.path = req.path;
            results.resourceName = resourceName;
            results.resourceType = 'instance';
            results.req = req;
            return utility.hypermediaStage(results, callback);
          }
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          return utility.renderTemplate(res, results, resourceName,  200, {});
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
  
  // REMOVE HIERARCHICAL ASSOCIATION
  this.removeChildInstances = function(req, res, resourceName, resourcePath, parentResourceName, parentPath, resourcePathRegex){    
    var findQuery = {};
    var pullQuery = {};
    findQuery['id'] = req.params[resourceName + 'InstanceId'];
    if(parentResourceName !== ''){
      findQuery[parentResourceName + '_' ] = parentPath;
      pullQuery[parentResourceName + '_' ] = parentPath;
    }
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
          if(parentResourceName !== ''){
            var data = {};
            data.options = {};
            data.updateQuery = {};
            data.model = models[resourceName];
            data.query = findQuery;
            data.updateQuery['$pull'] = pullQuery;
            coredb.findAndUpdateRecords(data, callback);
          } else {
            callback(null, 'no parent resource for DELETE');
          }
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