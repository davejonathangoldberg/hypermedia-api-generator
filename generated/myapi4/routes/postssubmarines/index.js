module.exports = function PostsSubmarinesRoutes(app) {
  
  // RELATIVE REFERENCES 
  var Composer = require('../../shared/composer.js');
  var composer = new Composer();
  
  //  RESOURCE VARIABLES
  var resourceName = 'submarines';
  var parentResourceName = 'posts';
  var resourcesLength = 2;
  
  // ROUTE FUNCTIONS
  
  /*
   *    Global routes need the following:
   *    - Check the accept header
   *    - Check the content type header for POST and PUT
   *
   */
  
  app.get('/posts/:postsInstanceId/submarines', function(req, res, next){
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
    console.log('parentPath: ' + parentPath + '\n');
    var resourcePath = '';
    var query = {};
    if (parentPath !== ''){
      query[parentResourceName + '_'] = parentPath;
    }
    return composer.retrieveCollection(req, res, next, query, resourceName, resourcePath, parentResourceName, parentPath);
  });
  
  app.post('/posts/:postsInstanceId/submarines', function(req, res, next){      
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
    console.log('parentPath: ' + parentPath + '\n');
    var resourcePath = ''; 
    var body = req.body;
    return composer.createChildInstance(req, res, next, body, resourceName, parentResourceName, parentPath);
    //return createItem(res, req, next, models.posts, 'posts', 201, {"Location" : "http://localhost:5000"});
  });
  
  app.get('/posts/:postsInstanceId/submarines/:submarinesInstanceId', function(req, res, next){      
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
    console.log('parentPath: ' + parentPath + '\n');
    var query = {};
    var queryOptions = {};
    query['id'] = req.params[resourceName + 'InstanceId'];
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      query[parentResourceName + '_'] = parentPath;
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    return composer.retrieveInstance(req, res, query, queryOptions, resourceName);
  });
  
  app.put('/posts/:postsInstanceId/submarines/:submarinesInstanceId', function(req, res, next){      
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
    console.log('parentPath: ' + parentPath + '\n');
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    var options = { "upsert" : false };
    return composer.updateChildInstance(req, res, next, resourceName, resourcePath, parentResourceName, parentPath, options);
  });
  
  app.del('/posts/:postsInstanceId/submarines/:submarinesInstanceId', function(req, res, next){ // ONLY USED IN CASES WHERE THE SUB-INSTANCE IS PART OF A SEPARATE PARENT INSTANCE
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
    console.log('parentPath: ' + parentPath + '\n');
    if(parentResourceName !== ''){
      var resourcePath = parentPath + '|' + req.params[resourceName + 'InstanceId'];
      var resourcePathRegex = parentPath + "\\\|" + req.params[resourceName + 'InstanceId'];
    } else {
      var resourcePath = req.params[resourceName + 'InstanceId'];
    }
    return composer.removeChildInstances(req, res, resourceName, resourcePath, parentResourceName, parentPath, resourcePathRegex);
  });
  
}
