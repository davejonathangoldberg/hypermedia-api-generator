module.exports = function TagsRoutes(app) {
  
  // RELATIVE REFERENCES 
  var Composer = require('../../shared/composer.js');
  var composer = new Composer();
  
  //  RESOURCE VARIABLES
  var resourceName = 'tags';
  var parentResourceName = '';
  var resourcesLength = 1;
  
  // ROUTE FUNCTIONS
  
  /*
   *    Global routes need the following:
   *    - Check the accept header
   *    - Check the content type header for POST and PUT
   *
   */
  
  app.get('/tags', function(req, res, next){
    var parentPath = '';
    if (parentResourceName !== ''){
      for(var i=0; i < resourcesLength-1; i++){
        if(i == 0){
          parentPath = req.params['resource' + i + 'InstanceId'];
          console.log('parentPath: ' + parentPath + '\n');
        } else if (i == resourcesLength - 2) {
          parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
        } else {
          parentPath = parentPath + '|' + req.params[resource + i + 'InstanceId'];
        }
      }
    }
    var resourcePath = '';
    var query = {};
    query[parentResourceName + '_'] = parentPath;
    console.log('parentPath: ' + parentPath + '\n');
    return composer.retrieveCollection(req, res, next, query, resourceName, resourcePath, parentResourceName, parentPath);
  });
  
  app.get('/tags/:tagsInstanceId', function(req, res, next){      
    var parentPath = '';
    for(var i=0; i < resourcesLength-1; i++){
      if(i == 0){
        parentPath = req.params['resource' + i + 'InstanceId'];
      } else if (i == resourcesLength - 2) {
        parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
      } else {
        parentPath = parentPath + '|' + req.params['resource' + i + 'InstanceId'];
      }
    }
    var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
    var query = {};
    var queryOptions = {};
    var parentInstanceId = req.params[parentResourceName + 'InstanceId'];
    query['id'] = req.params[resourceName + 'InstanceId'];
    if(parentResourceName !== ''){
      query[parentResourceName + '_'] = parentPath;
    }
    return composer.retrieveInstance(req, res, query, queryOptions, resourceName);
  });
  
  app.put('/tags/:tagsInstanceId', function(req, res, next){      
    var parentPath = '';
    for(var i=0; i < resourcesLength-1; i++){
      if(i == 0){
        parentPath = req.params['resource' + i + 'InstanceId'];
      } else if (i == resourcesLength - 2) {
        parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
      } else {
        parentPath = parentPath + '|' + req.params['resource' + i + 'InstanceId'];
      }
    }
    var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
    var options = { "upsert" : false };
    return composer.updateChildInstance(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options);
  });
  
  app.del('/tags/:tagsInstanceId', function(req, res, next){ // ONLY USED IN CASES WHERE THE SUB-INSTANCE IS PART OF A SEPARATE PARENT INSTANCE
    var parentPath = '';
    for(var i=0; i < resourcesLength-1; i++){
      if(i == 0){
        parentPath = req.params['resource' + i + 'InstanceId'];
      } else if (i == resourcesLength - 2) {
        parentPath = parentPath + '|' + req.params[parentResourceName + 'InstanceId'];
      } else {
        parentPath = parentPath + '|' + req.params['resource' + i + 'InstanceId'];
      }
    }
    var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
    return composer.removeChildInstances(req, res, resourceName, resourcePath, parentResourceName, parentPath, resourcePathRegex);
  });
  
}
