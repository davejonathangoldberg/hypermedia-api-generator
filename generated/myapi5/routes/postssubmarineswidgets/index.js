module.exports = function PostsSubmarinesWidgetsRoutes(app) {
  
  // RELATIVE REFERENCES 
  var Composer = require('../../shared/composer.js');
  var composer = new Composer();
  
  //  RESOURCE VARIABLES
  var resourceName = 'widgets';
  var parentResourceName = 'submarines';
  var resourcesLength = 3;
  
  // ROUTE FUNCTIONS
  
  /*
   *    Global routes need the following:
   *    - Check the accept header
   *    - Check the content type header for POST and PUT
   *
   */
  
  app.get('/posts/:resource0InstanceId/submarines/:submarinesInstanceId/widgets', function(req, res, next){
    var parentPath = '';
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
    var resourcePath = '';
    var query = {};
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    query[resourceName + '_'] = {$not: {$size: 0}};
    return composer.retrieveCollection(req, res, next, query, resourceName, resourcePath, parentResourceName, parentPath);
  });
  
  app.get('/posts/:resource0InstanceId/submarines/:submarinesInstanceId/widgets/:widgetsInstanceId', function(req, res, next){      
    var parentPath = '';
    var query = {};
    var queryOptions = {};
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
    console.log('parentPath: ' + parentPath + '\n');
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    query['id'] = req.params[resourceName + 'InstanceId'];
    query[resourceName + '_'] = resourcePath;
    return composer.retrieveInstance(req, res, query, queryOptions, resourceName);
  });
  
  app.put('/posts/:resource0InstanceId/submarines/:submarinesInstanceId/widgets/:widgetsInstanceId', function(req, res, next){      
    var parentPath = '';
    var query = {};
    var queryOptions = {};
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
    var options = { "upsert" : true };
    return composer.updateChildInstance(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options);
  });
  
  app.del('/posts/:resource0InstanceId/submarines/:submarinesInstanceId/widgets/:widgetsInstanceId', function(req, res, next){ // ONLY USED IN CASES WHERE THE SUB-INSTANCE IS PART OF A SEPARATE PARENT INSTANCE
    var parentPath = '';
    var query = {};
    var queryOptions = {};
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
