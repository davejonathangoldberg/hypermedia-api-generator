module.exports = function PostsBlobRoutes(app) {
  
  // RELATIVE REFERENCES 
  var Composer = require('../../shared/composer.js');
  var composer = new Composer();
  
  //  RESOURCE VARIABLES
  var resourceName = 'blob';
  var parentResourceName = 'posts';
  var resourcesLength = 2;
  
  // ROUTE FUNCTIONS
  
  /*
   *    Global routes need the following:
   *    - Check the accept header
   *    - Check the content type header for POST and PUT
   *
   */
  
  app.get('/posts/:postsInstanceId/blob', function(req, res, next){      
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
  
  app.put('/posts/:postsInstanceId/blob', function(req, res, next){      
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
  
  app.del('/posts/:postsInstanceId/blob', function(req, res, next){ // ONLY USED IN CASES WHERE THE SUB-INSTANCE IS PART OF A SEPARATE PARENT INSTANCE
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
