module.exports = function DetailsRoutes(app) {
  
  // RELATIVE REFERENCES 
  var Composer = require('../../shared/composer.js');
  var composer = new Composer();
  
  //  RESOURCE VARIABLES
  var resourceName = 'details';
  var parentResourceName = '';
  var resourcesLength = 1;
  var lineage = 'details';
  var lineageArray = ['details'];
  
  // ROUTE FUNCTIONS
  
  /*
   *    Global routes need the following:
   *    - Check the accept header
   *    - Check the content type header for POST and PUT
   *
   */
  
  app.get('/details', function(req, res, next){      
    var parentPath = '';
    var query = {};
    var queryOptions = {};
    req.params[resourceName + 'InstanceId'] = resourceName;
    if (parentResourceName !== ''){
      for(var i=0; i < resourcesLength-1; i++){
        if(i == 0){
          parentPath = (resourcesLength > 2) ? req.params['resource' + i + 'InstanceId'] : req.params[parentResourceName + 'InstanceId'];
        } else if (i == resourcesLength - 2) {
          parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
        } else {
          parentPath = parentPath + '|' + req.params[resource + i + 'InstanceId'];
        }
      }
    }
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    var parentInstanceId = req.params[parentResourceName + 'InstanceId'];
    if(parentPath == ''){
      query['id'] = req.params[resourceName + 'InstanceId'];
      query[resourceName + '_'] = {$not : {$size : 0}};
    } else {
      query['id'] = req.params[resourceName + 'InstanceId'];
      query[resourceName + '_'] = resourcePath;
    }
    return composer.retrieveInstance(req, res, query, queryOptions, resourceName);
  });
  
  app.put('/details', function(req, res, next){      
    var parentPath = '';
    var query = {};
    var queryOptions = {};
    var instancesArray = [];
    if (parentResourceName !== ''){
      for(var i=0; i < resourcesLength-1; i++){
        if(i == 0){
          parentPath = (resourcesLength > 2) ? req.params['resource' + i + 'InstanceId'] : req.params[parentResourceName + 'InstanceId'];
          if(resourcesLength > 2){
            instancesArray.push(req.params['resource' + i + 'InstanceId']);
          } else {
            instancesArray.push(req.params[parentResourceName + 'InstanceId']);
          }
        } else if (i == resourcesLength - 2) {
          parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
        } else {
          parentPath = parentPath + '|' + req.params[resource + i + 'InstanceId'];
          instancesArray.push(req.params[resource + i + 'InstanceId']);
        }
      }
    }
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    var options = { "upsert" : true };
    return composer.updateStubInstance(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options, instancesArray, lineageArray);
  });
  
  app.del('/details', function(req, res, next){ // ONLY USED IN CASES WHERE THE SUB-INSTANCE IS PART OF A SEPARATE PARENT INSTANCE
    var parentPath = '';
    var query = {};
    var queryOptions = {};
    req.params[resourceName + 'InstanceId'] = resourceName;
    if (parentResourceName !== ''){
      for(var i=0; i < resourcesLength-1; i++){
        if(i == 0){
          parentPath = (resourcesLength > 2) ? req.params['resource' + i + 'InstanceId'] : req.params[parentResourceName + 'InstanceId'];
          parentPathRegex = (resourcesLength > 2) ? req.params['resource' + i + 'InstanceId'] : req.params[parentResourceName + 'InstanceId'];
        } else if (i == resourcesLength - 2) {
          parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
          parentPathRegex = parentPathRegex + '\\\|' + req.params[parentResourceName + 'InstanceId'];
        } else {
          parentPathRegex = parentPathRegex + '\\\|' + req.params[resource + i + 'InstanceId'];
        }
      }
    }
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      var resourcePathRegex = parentPathRegex + "\\\|" + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
      var resourcePathRegex = req.params[resourceName + 'InstanceId'];
    }
    return composer.removeChildInstances(req, res, resourceName, resourcePath, parentResourceName, parentPath, resourcePathRegex);
  });
  
}
