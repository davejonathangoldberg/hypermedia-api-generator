module.exports = function Composer(app) {
  
  // REQUIRED LIBRARIES
  var mongoose = require('mongoose');
  var async = require('async');
  var jjv = require('jjv');
  var Combinatorics = require('js-combinatorics').Combinatorics;
  
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
  
  // RETRIEVE ROOT
  this.retrieveRoot = function(req, res){ 
    async.waterfall(
      [
        function(callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          var results = {};
          results.parent = req.path.split('/');
          results.path = req.path;
          results.resourceName = 'root';
          results.resourceType = 'instance';
          results.req = req;
          return utility.hypermediaStage(results, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          console.log('results root: ' + JSON.stringify(results));
          return utility.renderTemplate(res, results, results.resourceName,  200, {});
        }
      });
  }
  
  
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
            console.log('results from collection: ' + JSON.stringify(results));
            results.parent = req.path.split('/');
            results.parent.pop();
            results.parent = results.parent.join('/');
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
            results.parent = req.path.split('/');
            results.parent.pop();
            results.parent = results.parent.join('/');
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
  this.createChildInstance = function(req, res, next, body, resourceName, parentResourceName, parentPath, instancesArray, lineageArray){
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
            /*
             *  START EXPERIMENTATION FOR PERMUTATIONS NOW
             */
            
            var instanceMap = {};
            var data = {};
            var instanceRoutes = [];
            data.query = {};
            body.modifiedDate = new Date();
            data.body = body;
            
            // MAPS IDS FOR CURRENT REQUEST TO ROUTES FOR LOOKING UP.
            for(q=0; q<meta['validRoutes'].length; q++){
              instanceRoutes.push(meta['validRoutes'][q]);
            }
            instancesArray.push(req.body.id); 
            
            for(i=0; i<lineageArray.length; i++){
              for(j=0; j<instanceRoutes.length; j++){
                instanceRoutes[j] = instanceRoutes[j].replace(lineageArray[i], instancesArray[i]);
                console.log('meta[validroutes] after replace: ' + JSON.stringify(meta['validRoutes']));
              }
              instanceMap[instancesArray[i]] = lineageArray[i];
            };
            
            // FOR EACH RESOURCE GET ALL POTENTIAL ROUTES AND FILTER. ADD NEW RESOURCE ENTRY AND UPDATE RELATED ENTRIES. 
            async.each(instancesArray, function( resource, callback ) {
              console.log('resource: ' + resource);
              var currentResourceName = instanceMap[resource];
              data.model = models[currentResourceName];
              data.query['id'] = resource;
              var reducedInstancesArray = instancesArray;
              var activeResourceIndex = reducedInstancesArray.indexOf(resource);
              var potentialRoutes = Combinatorics.permutationCombination(reducedInstancesArray);
              var filteredRoutes = potentialRoutes.filter(function(a){
                if(resource != body.id){
                  return ((a.indexOf(body.id) > -1) && !(a.indexOf(resource) > -1));
                } else {
                  return ((a.indexOf(body.id) > -1) &&  (a.indexOf(body.id) == (a.length - 1))) ;
                }
              });
              /*
               *
               *  THE FOLLOWING EXECUTES THIS LOGIC:
               *    1. IF THE RESOURCE IS NOT THE 'NEW' RESOURCE
               *      1A. ITERATE THROUGH ARRAY OF RESOURCE PATH ARRAYS
               *      1B. JOIN ARRAY WITH PIPE AND ADD IT TO THE PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      1C. PUSH THE RESOURCE TO THE END OF THE RESOURCE PATH ARRAY
               *      1D. JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *    2. IF THE RESOURCE IS THE NEW RESOURCE
               *      2A. ITERATE THROUGH THE ARRAY OF RESOURCE PATH ARRAYS
               *      2B. IF THE ARRAY > LENGTH 1, JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *        2C. REMOVE LAST ELEMENT OF ARRAY
               *        2D. JOIN AND ADD TO PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      2E. IF THE ARRAY LENGTH = 1, ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *
               */
              
              if(resource != body.id){
                var newParentPathsArray = [];  // ARRAY THAT HOLDS PARENT PATHS TO APPEND TO EXISTING RESOURCES
                var newResourcePathsArray = []; // ARRAY THAT HOLDS RESOURCE PATHS TO APPEND TO EXISTING RESOURCES
                for(i=0; i<filteredRoutes.length; i++){
                  filteredRoutes[i].push(resource);
                  var joinedRoute = filteredRoutes[i].join('|');
                  var checkRoute = filteredRoutes[i].join('');
                  if(instanceRoutes.indexOf(checkRoute) > -1){ // WHERE THE MAGIC HAPPENS. IF TRUE, THEN STAGE TO LOAD NEW RECORD INTO THESE RESOURCES. 
                    newParentPathsArray.push(joinedRoute);
                    filteredRoutes[i].pop();
                    var joinedParentRoute = filteredRoutes[i].join('|');
                    newResourcePathsArray.push(joinedParentRoute);
                  }
                }
                var pushQuery = {};
                pushQuery[parentResourceName + '_'] = { '$each' : newParentPathsArray };
                pushQuery[resourceName + '_'] = { '$each' : newResourcePathsArray };
                data.updateQuery = {};
                data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
                data.updateQuery['$set'] = { "modifiedDate" : body.modifiedDate };
                coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
              } else {
                data.body.createdDate = new Date();
                data.body[resourceName + '_'] = [];
                if(parentResourceName != '' || (filteredRoutes.length > 1)){
                  data.body[parentResourceName + '_'] = [];
                }
                for(i=0; i<filteredRoutes.length; i++){
                  if(filteredRoutes[i].length !== 1){
                    var joinedRoute = filteredRoutes[i].join('|');
                    var checkRoute = filteredRoutes[i].join('');
                    if(instanceRoutes.indexOf(checkRoute) > -1){
                      data.body[resourceName + '_'].push(joinedRoute);
                      filteredRoutes[i].pop();
                      var joinedParentRoute = filteredRoutes[i].join('|');
                      data.body[parentResourceName + '_'].push(joinedParentRoute);
                    }
                  } else {
                    if(instanceRoutes.indexOf(String(filteredRoutes[i])) > -1){
                      console.log('filteredRoutes[i]: ' + filteredRoutes[i]);
                      data.body[resourceName + '_'].push(String(filteredRoutes[i]));
                    }
                  }
                }
                coredb.insertItem(data, callback);
              }
            }, function(err){
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                  console.log('A resource failed to process');
                  callback(err);
                } else {
                  console.log('All files have been processed successfully');
                  callback(null, {"instance" : data.body});
                }
            });
            
            
            /*
             *  END EXPERIMENTATION FOR PERMUTATIONS NOW
             */
            
            
          } else {
            return utility.returnNotFound(res);
          }
        },
        function(results, callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          console.log('results: ' + JSON.stringify(results));
          console.log('results.instance bool: ' + !(!results.instance));
          if (!results.instance){
            return utility.returnNotFound(res); // RETURNS 404 ERROR
          } else {
            results.parent = req.path.split('/');
            results.parent.pop();
            results.parent = results.parent.join('/');
            results.path = req.path;
            if (results.path.substr(-1) != '/') results.path += '/';
            results.path += body.id;
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
          console.log('create results: ' + JSON.stringify(results) + '\n');
          return utility.renderTemplate(res, results, resourceName,  201, {'Location' : 'http://localhost:5000'});
        }
      });
  }
  
  // UPDATE CHILD INSTANCE
  this.updateChildInstance = function(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options, instancesArray, lineageArray){    
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
            
            /*
             *  START EXPERIMENTATION FOR PERMUTATIONS NOW
             */
            
            var instanceMap = {};
            var data = {};
            var temporaryRoutesArray = {};
            var instanceRoutes = [];
            data.options = {};
            data.statusCode = 201;
            data.options.upsert = true;
            req.body.modifiedDate = new Date();
            req.body.id = req.params[resourceName + 'InstanceId'];
            data.query = {};
            data.body = req.body;
            
            // MAPS IDS FOR CURRENT REQUEST TO ROUTES FOR LOOKING UP.
            
            
            for(q=0; q<meta['validRoutes'].length; q++){
              instanceRoutes.push(meta['validRoutes'][q]);
            }
            instancesArray.push(req.body.id); 
            
            for(i=0; i<lineageArray.length; i++){
              for(j=0; j<instanceRoutes.length; j++){
                instanceRoutes[j] = instanceRoutes[j].replace(lineageArray[i], instancesArray[i]);
                console.log('meta[validroutes] after replace: ' + JSON.stringify(meta['validRoutes']));
              }
              instanceMap[instancesArray[i]] = lineageArray[i];
            };
            
            // FOR EACH RESOURCE GET ALL POTENTIAL ROUTES AND FILTER. ADD NEW RESOURCE ENTRY AND UPDATE RELATED ENTRIES. 
            console.log('data.options: ' + JSON.stringify(data.options) + '\n');
            console.log('instancesArray: ' + JSON.stringify(instancesArray) + '\n');
            async.each(instancesArray, function( resource, callback ) {
              console.log('each blah');
              console.log('data.options in each: ' + JSON.stringify(data.options) + '\n');
              console.log('resource: ' + resource);
              var currentResourceName = instanceMap[resource];
              data.model = models[currentResourceName];
              data.query['id'] = resource;
              var reducedInstancesArray = instancesArray;
              var activeResourceIndex = reducedInstancesArray.indexOf(resource);
              var potentialRoutes = Combinatorics.permutationCombination(reducedInstancesArray);
              var filteredRoutes = potentialRoutes.filter(function(a){
                if(resource != req.body.id){
                  return ((a.indexOf(req.body.id) > -1) && !(a.indexOf(resource) > -1));
                } else {
                  return ((a.indexOf(req.body.id) > -1) &&  (a.indexOf(req.body.id) == (a.length - 1))) ;
                }
              });
              console.log('filteredRoutes: ' + JSON.stringify(filteredRoutes));
              /*
               *
               *  THE FOLLOWING EXECUTES THIS LOGIC:
               *    1. IF THE RESOURCE IS NOT THE 'NEW' RESOURCE
               *      1A. ITERATE THROUGH ARRAY OF RESOURCE PATH ARRAYS
               *      1B. JOIN ARRAY WITH PIPE AND ADD IT TO THE PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      1C. PUSH THE RESOURCE TO THE END OF THE RESOURCE PATH ARRAY
               *      1D. JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *    2. IF THE RESOURCE IS THE NEW RESOURCE
               *      2A. ITERATE THROUGH THE ARRAY OF RESOURCE PATH ARRAYS
               *      2B. IF THE ARRAY > LENGTH 1, JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *        2C. REMOVE LAST ELEMENT OF ARRAY
               *        2D. JOIN AND ADD TO PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      2E. IF THE ARRAY LENGTH = 1, ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *
               */
              
              if(resource != req.body.id){
                var newParentPathsArray = [];  // ARRAY THAT HOLDS PARENT PATHS TO APPEND TO EXISTING RESOURCES
                var newResourcePathsArray = []; // ARRAY THAT HOLDS RESOURCE PATHS TO APPEND TO EXISTING RESOURCES
                for(i=0; i<filteredRoutes.length; i++){
                  filteredRoutes[i].push(resource);
                  var joinedRoute = filteredRoutes[i].join('|');
                  var checkRoute = filteredRoutes[i].join('');
                  console.log('instanceRoutes: ' + JSON.stringify(instanceRoutes));
                  console.log('checkRoute: ' + checkRoute);
                  console.log('instanceRoutes.indexOf(checkRoute): ' + instanceRoutes.indexOf(checkRoute));
                  if(instanceRoutes.indexOf(checkRoute) > -1){ // WHERE THE MAGIC HAPPENS. IF TRUE, THEN STAGE TO LOAD NEW RECORD INTO THESE RESOURCES. 
                    newParentPathsArray.push(joinedRoute);
                    filteredRoutes[i].pop();
                    var joinedParentRoute = filteredRoutes[i].join('|');
                    newResourcePathsArray.push(joinedParentRoute);
                  }
                }
                var pushQuery = {};
                pushQuery[parentResourceName + '_'] = { '$each' : newParentPathsArray };
                pushQuery[resourceName + '_'] = { '$each' : newResourcePathsArray };
                data.updateQuery = {};
                data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
                data.updateQuery['$set'] = { "modifiedDate" : req.body.modifiedDate };
                coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
              } else {
                data.body.createdDate = new Date();
                var newResourcePathsArray = []; // ARRAY THAT HOLDS RESOURCE PATHS TO APPEND TO EXISTING RESOURCES
                if(parentResourceName != '' || (filteredRoutes.length > 1)){
                  var newParentPathsArray = [];  // ARRAY THAT HOLDS PARENT PATHS TO APPEND TO EXISTING RESOURCES
                }
                for(i=0; i<filteredRoutes.length; i++){
                  if(filteredRoutes[i].length !== 1){
                    var joinedRoute = filteredRoutes[i].join('|');
                    var checkRoute = filteredRoutes[i].join('');
                    console.log('instanceRoutes: ' + JSON.stringify(instanceRoutes));
                    console.log('checkRoute: ' + checkRoute);
                    console.log('instanceRoutes.indexOf(checkRoute): ' + instanceRoutes.indexOf(checkRoute));
                    if(instanceRoutes.indexOf(checkRoute) > -1){
                      newResourcePathsArray.push(joinedRoute);
                      filteredRoutes[i].pop();
                      var joinedParentRoute = filteredRoutes[i].join('|');
                      newParentPathsArray.push(joinedParentRoute);
                    }
                  } else {
                    console.log('instanceRoutes: ' + JSON.stringify(instanceRoutes) );
                    console.log('filteredRoutes[i]: ' + filteredRoutes[i] );
                    console.log('typeof filteredRoutes[i]: ' + typeof(filteredRoutes[i]) );
                    console.log('instanceRoutes.indexOf(String(filteredRoutes[i])): ' + instanceRoutes.indexOf(String(filteredRoutes[i])) );
                    if(instanceRoutes.indexOf(String(filteredRoutes[i])) > -1){
                      console.log('filteredRoutes[i]: ' + filteredRoutes[i]);
                      newResourcePathsArray.push(String(filteredRoutes[i]));
                    }
                  }
                }
                var pushQuery = {};
                if(parentResourceName != '' || (filteredRoutes.length > 1)){
                  pushQuery[parentResourceName + '_'] = { '$each' : newParentPathsArray };
                }
                pushQuery[resourceName + '_'] = { '$each' : newResourcePathsArray };
                data.updateQuery = {};
                data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
                data.updateQuery['$set'] = data.body; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT;
                console.log('right before findandUpdateRecords: ' + JSON.stringify(data) + ' \n');
                coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
              }
            }, function(err){
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                  console.log('A resource failed to process');
                  callback(err);
                } else {
                  console.log('All files have been processed successfully');
                  data.instance = true;
                  callback(null, data );
                }
            });
            
          } else { // THE CHILD RESOURCE DOESN'T EXIST AND CAN'T INSERT IT
            callback(null, { 'instance' : false }); // CALLBACK SHOULD RESULT IN A 404
            //callback('The child resource does not exist and cannot be inserted', ''); // CALLBACK SHOULD RESULT IN AN ERROR
          }
        },
        function(results, callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          if (!results.instance){
            return utility.returnNotFound(res); // RETURNS 404 ERROR
          } else {
            results.parent = req.path.split('/');
            results.parent.pop();
            results.parent = results.parent.join('/');
            results.path = req.path;
            results.resourceName = resourceName;
            results.resourceType = 'instance';
            results.req = req;
            return utility.hypermediaStage(results, callback);
          }
        }
      ],
      function (err, results) {
        console.log('final result: ' + JSON.stringify(results) + '\n');
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
          return utility.returnServerError(res);   
        } else {
          return utility.renderTemplate(res, results, resourceName, results.statusCode, results.headerObject);
        }
      });
  }
  
  // UPDATE STUB INSTANCE
  this.updateStubInstance = function(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options, instancesArray, lineageArray){    
    options.upsert = options.upsert || false;
    async.waterfall(
      [
        function(callback){
          req.body.id = resourceName;
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
            data.query['id'] = resourceName;
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
            data.query['id'] = resourceName;
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            data.updateQuery['$set'] = req.body; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT
            data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
          } else if(results.instance) { // RESOURCE EXISTS UNDER THE PARENT PATH
            console.log('just results.instance');
            data.statusCode = 200;
            data.headerObject = {};
            data.query['id'] = resourceName;
            data.updateQuery = {};
            req.body.modifiedDate = new Date();
            data.updateQuery['$set'] = req.body; // CORE RESOURCE INFORMATON TO UPDATE
            coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
          } else if(data.options.upsert){ // IF THE CHILD RESOURCE DOESN'T EXIST, BUT UPSERT == TRUE, THEN INSERT IT
            
            /*
             *  START EXPERIMENTATION FOR PERMUTATIONS NOW
             */
            
            var instanceMap = {};
            var data = {};
            var instanceRoutes = [];
            data.options = {};
            data.statusCode = 201;
            data.options.upsert = true;
            req.body.modifiedDate = new Date();
            req.body.id = resourceName;
            data.query = {};
            data.body = req.body;
            
            // MAPS IDS FOR CURRENT REQUEST TO ROUTES FOR LOOKING UP.
            for(q=0; q<meta['validRoutes'].length; q++){
              instanceRoutes.push(meta['validRoutes'][q]);
            }
            instancesArray.push(req.body.id); 
            
            for(i=0; i<lineageArray.length; i++){
              for(j=0; j<instanceRoutes.length; j++){
                instanceRoutes[j] = instanceRoutes[j].replace(lineageArray[i], instancesArray[i]);
                console.log('meta[validroutes] after replace: ' + JSON.stringify(meta['validRoutes']));
              }
              instanceMap[instancesArray[i]] = lineageArray[i];
            };
            // FOR EACH RESOURCE GET ALL POTENTIAL ROUTES AND FILTER. ADD NEW RESOURCE ENTRY AND UPDATE RELATED ENTRIES. 
            console.log('data.options: ' + JSON.stringify(data.options) + '\n');
            async.each(instancesArray, function( resource, callback ) {
              console.log('data.options in each: ' + JSON.stringify(data.options) + '\n');
              console.log('resource: ' + resource);
              var currentResourceName = instanceMap[resource];
              data.model = models[currentResourceName];
              data.query['id'] = resource;
              var reducedInstancesArray = instancesArray;
              var activeResourceIndex = reducedInstancesArray.indexOf(resource);
              var potentialRoutes = Combinatorics.permutationCombination(reducedInstancesArray);
              var filteredRoutes = potentialRoutes.filter(function(a){
                if(resource != req.body.id){
                  return ((a.indexOf(req.body.id) > -1) && !(a.indexOf(resource) > -1));
                } else {
                  return ((a.indexOf(req.body.id) > -1) &&  (a.indexOf(req.body.id) == (a.length - 1))) ;
                }
              });
              /*
               *
               *  THE FOLLOWING EXECUTES THIS LOGIC:
               *    1. IF THE RESOURCE IS NOT THE 'NEW' RESOURCE
               *      1A. ITERATE THROUGH ARRAY OF RESOURCE PATH ARRAYS
               *      1B. JOIN ARRAY WITH PIPE AND ADD IT TO THE PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      1C. PUSH THE RESOURCE TO THE END OF THE RESOURCE PATH ARRAY
               *      1D. JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *    2. IF THE RESOURCE IS THE NEW RESOURCE
               *      2A. ITERATE THROUGH THE ARRAY OF RESOURCE PATH ARRAYS
               *      2B. IF THE ARRAY > LENGTH 1, JOIN ARRAY WITH PIPE AND ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *        2C. REMOVE LAST ELEMENT OF ARRAY
               *        2D. JOIN AND ADD TO PARENT RESOURCE ARRAY FOR THE DB RECORD
               *      2E. IF THE ARRAY LENGTH = 1, ADD IT TO THE RESOURCE ARRAY FOR THE DB RECORD
               *
               */
              
              if(resource != req.body.id){
                var newParentPathsArray = [];  // ARRAY THAT HOLDS PARENT PATHS TO APPEND TO EXISTING RESOURCES
                var newResourcePathsArray = []; // ARRAY THAT HOLDS RESOURCE PATHS TO APPEND TO EXISTING RESOURCES
                for(i=0; i<filteredRoutes.length; i++){
                  filteredRoutes[i].push(resource);
                  var joinedRoute = filteredRoutes[i].join('|');
                  var checkRoute = filteredRoutes[i].join('');
                  if(instanceRoutes.indexOf(checkRoute) > -1){ // WHERE THE MAGIC HAPPENS. IF TRUE, THEN STAGE TO LOAD NEW RECORD INTO THESE RESOURCES. 
                    newParentPathsArray.push(joinedRoute);
                    filteredRoutes[i].pop();
                    var joinedParentRoute = filteredRoutes[i].join('|');
                    newResourcePathsArray.push(joinedParentRoute);
                  }
                }
                var pushQuery = {};
                pushQuery[parentResourceName + '_'] = { '$each' : newParentPathsArray };
                pushQuery[resourceName + '_'] = { '$each' : newResourcePathsArray };
                data.updateQuery = {};
                data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
                data.updateQuery['$set'] = { "modifiedDate" : req.body.modifiedDate };
                coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE AND APPEND TO THE PARENT PATH
              } else {
                data.body.createdDate = new Date();
                var newResourcePathsArray = []; // ARRAY THAT HOLDS RESOURCE PATHS TO APPEND TO EXISTING RESOURCES
                if(parentResourceName != '' || (filteredRoutes.length > 1)){
                  var newParentPathsArray = [];  // ARRAY THAT HOLDS PARENT PATHS TO APPEND TO EXISTING RESOURCES
                }
                for(i=0; i<filteredRoutes.length; i++){
                  if(filteredRoutes[i].length !== 1){
                    var joinedRoute = filteredRoutes[i].join('|');
                    var checkRoute = filteredRoutes[i].join('');
                    if(instanceRoutes.indexOf(checkRoute) > -1){
                      newResourcePathsArray.push(joinedRoute);
                      filteredRoutes[i].pop();
                      var joinedParentRoute = filteredRoutes[i].join('|');
                      newParentPathsArray.push(joinedParentRoute);
                    }
                  } else {
                    if(instanceRoutes.indexOf(String(filteredRoutes[i])) > -1){
                      console.log('filteredRoutes[i]: ' + filteredRoutes[i]);
                      newResourcePathsArray.push(String(filteredRoutes[i]));
                    }
                  }
                }
                var pushQuery = {};
                if(parentResourceName != '' || (filteredRoutes.length > 1)){
                  pushQuery[parentResourceName + '_'] = { '$each' : newParentPathsArray };
                }
                pushQuery[resourceName + '_'] = { '$each' : newResourcePathsArray };
                data.updateQuery = {};
                data.updateQuery['$push'] = pushQuery; // ADD THE PARENT RESOURCE PATH TO THE PARENT PATH ARRAY.
                data.updateQuery['$set'] = data.body; // CORE RESOURCE INFORMATON TO UPDATE OR INSERT;
                console.log('right before findandUpdateRecords: ' + JSON.stringify(data) + ' \n');
                coredb.findAndUpdateRecords(data, callback); // UPDATE THE CHILD RESOURCE
              }
            }, function(err){
                // if any of the file processing produced an error, err would equal that error
                if( err ) {
                  console.log('A resource failed to process');
                  callback(err);
                } else {
                  console.log('All files have been processed successfully');
                  data.instance = true;
                  callback(null, data );
                }
            });
            
          } else { // THE CHILD RESOURCE DOESN'T EXIST AND CAN'T INSERT IT
            callback(null, { 'instance' : false }); // CALLBACK SHOULD RESULT IN A 404
            //callback('The child resource does not exist and cannot be inserted', ''); // CALLBACK SHOULD RESULT IN AN ERROR
          }
        },
        function(results, callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          if (!results.instance){
            return utility.returnNotFound(res); // RETURNS 404 ERROR
          } else {
            results.parent = req.path.split('/');
            results.parent.pop();
            results.parent = results.parent.join('/');
            results.path = req.path;
            results.resourceName = resourceName;
            results.resourceType = 'instance';
            results.req = req;
            return utility.hypermediaStage(results, callback);
          }
        }
      ],
      function (err, results) {
        console.log('final result: ' + JSON.stringify(results) + '\n');
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
          return utility.returnServerError(res);   
        } else {
          return utility.renderTemplate(res, results, resourceName, results.statusCode, results.headerObject);
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
        },
        function(callback){ // STAGES THE RESULTS INCLUDING HYPERMEDIA FOR THE RESPONSE
          var hypermediaObject = {};
          hypermediaObject.parent = req.path.split('/');
          hypermediaObject.parent.pop();
          hypermediaObject.parent = hypermediaObject.parent.join('/');
          hypermediaObject.path = req.path;
          hypermediaObject.resourceName = resourceName;
          hypermediaObject.resourceType = 'instance';
          hypermediaObject.req = req;
          return utility.hypermediaStage(hypermediaObject, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.error(err);
          return utility.returnServerError(res); // RETURNS 500 ERROR 
        } else {          
          console.log('Final Results Updated Record -- TRUE: ' + JSON.stringify(results) + '\n');
          return utility.renderTemplate(res, results[2], resourceName,  204, {});
        }
      });
    
    
  }
  
}