module.exports = function Routes(app) {
  
  // REQUIRED LIBRARIES
  var jjv = require('jjv');
  var ZSchema = require('z-schema');
  var async = require('async');
  
  // RELATIVE REFERENCES 
  var Validation = require('../lib/validation.js');
  var Transform = require('../lib/transform.js')
  var WriteProject = require('../lib/write_project_new.js');
  var LaunchProject = require('../lib/launch_project.js');
  var validation = new Validation();
  var transform = new Transform();
  var writeProject = new WriteProject(app);
  var launchProject = new LaunchProject();
  
  app.post('/', function(req, res, next){      
    
    /*
     *
     * RECONSTRUCT REQ.BODY INTO DATA OBJECT FOR EASIER PROCESSING
     *
     */
    
    // INITIALIZE VARIABLES
    var data = {};
    data.apiOptions = {};
    data.apiResources = {};
    data.apiModels = [];
    
    // MAP API OPTIONS
    data.apiOptions.basepath = req.body.basepath ? req.body.basepath : '/';
    data.apiOptions.mediaType = req.body.mediaType ? req.body.mediaType : 'application/json';
    data.apiOptions.apiName = req.body.apiName ? req.body.apiName : 'testName';
    
    // MAP API RESOURCES
    data.apiResources = req.body.resources ? { "resources" : req.body.resources } : null;
    
    // MAP API MODELS
    data.apiModels = req.body.models ? req.body.models : [{}];
    
    // EXECUTE APPLICATION STEPS IN SERIES
    async.waterfall(
      [
        function(callback){ // VALIDATE INPUT
          validation.validateInputData(data, callback);
        },
        function(results, callback){ // TRANSFORM INPUT
          transform.transformInput(data, callback);
        },
        function(transformedData, callback){ // WRITE PROJECT STRUCTURE AND COPY STATIC FILES
          console.log('results after transform: ' + JSON.stringify(transformedData) + '\n');
          writeProject.projectStructure(transformedData, callback);
        },
        function(transformedData, callback){ // LAUNCH APP LOCALLY
          launchProject.localLaunch(transformedData, callback);
        }
      ],
      function(err, results){
        if (err) {
          console.log('err: ' + JSON.stringify(err) + '\n');
        } else {
          //console.log('success: ' + JSON.stringify(data) + '\n');
          return res.json(data);
        }
      });  
    
    
  });

}
